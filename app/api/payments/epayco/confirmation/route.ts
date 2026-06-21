export const runtime = "edge";

import { getDB } from "@/lib/db/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook server-to-server de ePayco. Se llama cuando una transacción cambia
 * de estado. Verifica la firma y, si el pago fue aceptado, activa (o renueva)
 * la suscripción del gym por 30 días en `gym_subscriptions`.
 *
 * Doc firma ePayco:
 *   sha256(p_cust_id_cliente ^ p_key ^ x_ref_payco ^ x_transaction_id ^ x_amount ^ x_currency_code)
 */
export async function POST(request: NextRequest) {
  const body = await request.formData();

  const estado = String(body.get("x_transaction_state") ?? "");
  const refPayco = String(body.get("x_ref_payco") ?? "");
  const transactionId = String(body.get("x_transaction_id") ?? "");
  const amount = String(body.get("x_amount") ?? "");
  const currency = String(body.get("x_currency_code") ?? "");
  const signature = String(body.get("x_signature") ?? "");
  const gymId = String(body.get("x_extra2") ?? "");
  const gymName = String(body.get("x_extra1") ?? "");

  const custId = process.env.EPAYCO_CUST_ID;
  const pKey = process.env.EPAYCO_P_KEY;

  if (!custId || !pKey) {
    console.error("[ePayco confirmation] faltan EPAYCO_CUST_ID o EPAYCO_P_KEY");
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  // 1) Validar firma para asegurar que el POST viene de ePayco y no fue alterado.
  const expected = await sha256(
    [custId, pKey, refPayco, transactionId, amount, currency].join("^")
  );

  if (!signature || signature.toLowerCase() !== expected.toLowerCase()) {
    console.warn(`[ePayco confirmation] firma inválida ref=${refPayco}`);
    return NextResponse.json({ error: "Firma inválida" }, { status: 403 });
  }

  console.log(
    `[ePayco confirmation] estado=${estado} ref=${refPayco} gymId=${gymId} gym=${gymName} monto=${amount}`
  );

  // 2) Solo activamos con pago aceptado. ePayco usa "Aceptada" / estado "1".
  const aceptada = estado === "Aceptada" || estado === "1";
  if (!aceptada) {
    return NextResponse.json({ ok: true, ignored: estado });
  }

  if (!gymId) {
    console.error(`[ePayco confirmation] pago aceptado sin gymId ref=${refPayco}`);
    return NextResponse.json({ ok: true, warning: "sin gymId" });
  }

  const db = getDB();

  // Validar que el gym existe antes de tocar la suscripción.
  const gym = await db
    .prepare(`SELECT id FROM gyms WHERE id = ?`)
    .bind(gymId)
    .first<{ id: string }>();

  if (!gym) {
    console.error(`[ePayco confirmation] gym inexistente gymId=${gymId} ref=${refPayco}`);
    return NextResponse.json({ ok: true, warning: "gym inexistente" });
  }

  // 3) Idempotencia: si ya procesamos esta referencia, no duplicamos.
  const already = await db
    .prepare(`SELECT id FROM gym_subscriptions WHERE id = ?`)
    .bind(refPayco)
    .first<{ id: string }>();

  if (already) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  // 4) Renovar: si hay una suscripción activa vigente, sumamos 30 días sobre
  //    su vencimiento; si no, contamos desde hoy.
  const current = await db
    .prepare(
      `SELECT expires_at FROM gym_subscriptions
       WHERE gym_id = ? AND status = 'active'
       ORDER BY started_at DESC LIMIT 1`
    )
    .bind(gymId)
    .first<{ expires_at: string | null }>();

  const now = Date.now();
  const base =
    current?.expires_at && new Date(current.expires_at).getTime() > now
      ? new Date(current.expires_at).getTime()
      : now;
  const expiresAt = new Date(base + 30 * 24 * 60 * 60 * 1000).toISOString();

  await db
    .prepare(
      `INSERT INTO gym_subscriptions (id, gym_id, status, started_at, expires_at)
       VALUES (?, ?, 'active', datetime('now'), ?)`
    )
    .bind(refPayco, gymId, expiresAt)
    .run();

  console.log(`[ePayco confirmation] suscripción activada gymId=${gymId} hasta=${expiresAt}`);

  return NextResponse.json({ ok: true, gymId, expiresAt });
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

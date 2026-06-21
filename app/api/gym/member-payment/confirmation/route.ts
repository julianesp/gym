export const runtime = "edge";


import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

// ePayco POST a esta URL cuando el miembro paga una tiquetera
export async function POST(request: NextRequest) {
  const gymId = request.nextUrl.searchParams.get("gymId");
  const body = await request.formData();

  const estado = body.get("x_transaction_state");
  const referencia = body.get("x_id_invoice");
  const packageId = body.get("x_extra2") as string | null;
  const memberId = body.get("x_extra3") as string | null;
  const monto = parseFloat((body.get("x_amount") as string) ?? "0");

  if (estado !== "Aceptada" || !gymId || !packageId || !memberId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const { env } = getRequestContext();
    const db: D1Database = (env as unknown as { DB: D1Database }).DB;

    // Obtener el paquete para calcular expiración y sesiones
    const pkg = await db
      .prepare(`SELECT total_sessions, validity_days FROM ticket_packages WHERE id = ?`)
      .bind(packageId)
      .first<{ total_sessions: number; validity_days: number }>();

    if (!pkg) return NextResponse.json({ ok: true });

    // Obtener el member_id real (en la tabla members, user_id = Clerk userId)
    const member = await db
      .prepare(`SELECT id FROM members WHERE user_id = ? AND gym_id = ?`)
      .bind(memberId, gymId)
      .first<{ id: string }>();

    if (!member) return NextResponse.json({ ok: true });

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + pkg.validity_days);

    await db
      .prepare(
        `INSERT INTO member_tickets
         (id, member_id, gym_id, package_id, total_sessions, remaining_sessions,
          expiration_date, status, payment_status, payment_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'paid', ?)`
      )
      .bind(
        crypto.randomUUID(),
        member.id,
        gymId,
        packageId,
        pkg.total_sessions,
        pkg.total_sessions,
        expDate.toISOString().split("T")[0],
        monto
      )
      .run();
  } catch (err) {
    console.error("[member-payment/confirmation]", err);
  }

  return NextResponse.json({ ok: true });
}

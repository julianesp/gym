export const runtime = "edge";


import { getRequestContext } from "@cloudflare/next-on-pages";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Guardar / actualizar config de pagos del gym (ePayco + Nequi)
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json() as {
    gymId?: string;
    epaycoPublicKey?: string;
    epaycoPrivateKey?: string;
    nequiNumber?: string;
    acceptsNequi: boolean;
    acceptsEpayco: boolean;
  };

  const { env } = getRequestContext();
  const db: D1Database = (env as unknown as { DB: D1Database }).DB;

  // Si no viene gymId, buscarlo por owner_id
  const gym = body.gymId
    ? await db.prepare(`SELECT id FROM gyms WHERE id = ? AND owner_id = ?`).bind(body.gymId, userId).first<{ id: string }>()
    : await db.prepare(`SELECT id FROM gyms WHERE owner_id = ? LIMIT 1`).bind(userId).first<{ id: string }>();

  if (!gym) return NextResponse.json({ error: "Gimnasio no encontrado" }, { status: 404 });
  const gymId = gym.id;

  await db
    .prepare(
      `INSERT INTO gym_payment_config (gym_id, epayco_public_key, epayco_private_key, nequi_number, accepts_nequi, accepts_epayco)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(gym_id) DO UPDATE SET
         epayco_public_key = excluded.epayco_public_key,
         epayco_private_key = excluded.epayco_private_key,
         nequi_number = excluded.nequi_number,
         accepts_nequi = excluded.accepts_nequi,
         accepts_epayco = excluded.accepts_epayco,
         updated_at = datetime('now')`
    )
    .bind(
      gymId,
      body.epaycoPublicKey || null,
      body.epaycoPrivateKey || null,
      body.nequiNumber || null,
      body.acceptsNequi ? 1 : 0,
      body.acceptsEpayco ? 1 : 0,
    )
    .run();

  return NextResponse.json({ ok: true });
}

// GET — obtener config de pagos del gym del usuario autenticado
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { env } = getRequestContext();
  const db: D1Database = (env as unknown as { DB: D1Database }).DB;

  const config = await db
    .prepare(
      `SELECT gpc.epayco_public_key, gpc.nequi_number, gpc.accepts_nequi, gpc.accepts_epayco
       FROM gym_payment_config gpc
       JOIN gyms g ON g.id = gpc.gym_id
       WHERE g.owner_id = ?`
    )
    .bind(userId)
    .first<{
      epayco_public_key: string | null;
      nequi_number: string | null;
      accepts_nequi: number;
      accepts_epayco: number;
    }>();

  return NextResponse.json({ config: config ?? null });
}

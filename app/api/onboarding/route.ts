export const runtime = "edge";


import { getRequestContext } from "@cloudflare/next-on-pages";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json() as {
    gymName: string;
    description?: string;
    address: string;
    phone: string;
    email: string;
    city: string;
  };

  if (!body.gymName?.trim() || !body.address?.trim() || !body.phone?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const { env } = getRequestContext();
  const db: D1Database = (env as unknown as { DB: D1Database }).DB;

  // Verificar si el dueño ya tiene un gym registrado
  const existing = await db
    .prepare(`SELECT id FROM gyms WHERE owner_id = ?`)
    .bind(userId)
    .first<{ id: string }>();

  if (existing) {
    return NextResponse.json({ gymId: existing.id, alreadyExists: true });
  }

  const gymId = crypto.randomUUID();

  await db
    .prepare(
      `INSERT INTO gyms (id, owner_id, name, description, address, phone, email, trial_ends_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '+7 days'))`
    )
    .bind(
      gymId,
      userId,
      body.gymName.trim(),
      body.description?.trim() ?? null,
      body.address.trim(),
      body.phone.trim(),
      body.email.trim()
    )
    .run();

  const response = NextResponse.json({ gymId }, { status: 201 });
  // Cookie que el middleware lee para saber que el onboarding está completo
  response.cookies.set("gym_onboarding_done", "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 año
    path: "/",
  });
  return response;
}

// GET — verificar si el usuario ya completó el onboarding
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { env } = getRequestContext();
  const db: D1Database = (env as unknown as { DB: D1Database }).DB;

  const gym = await db
    .prepare(`SELECT id, name FROM gyms WHERE owner_id = ?`)
    .bind(userId)
    .first<{ id: string; name: string }>();

  return NextResponse.json({ hasGym: !!gym, gym: gym ?? null });
}

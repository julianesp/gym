export const runtime = "edge";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { env } = getRequestContext();
  const db: D1Database = (env as unknown as { DB: D1Database }).DB;

  const gym = await db
    .prepare(`SELECT name, description, address, city, phone, email FROM gyms WHERE owner_id = ? LIMIT 1`)
    .bind(userId)
    .first<{ name: string; description: string; address: string; city: string; phone: string; email: string }>();

  return NextResponse.json({ gym: gym ?? null });
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json() as {
    name?: string;
    description?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
  };

  const { env } = getRequestContext();
  const db: D1Database = (env as unknown as { DB: D1Database }).DB;

  await db
    .prepare(
      `UPDATE gyms SET name = ?, description = ?, address = ?, city = ?, phone = ?, email = ?, updated_at = datetime('now')
       WHERE owner_id = ?`
    )
    .bind(
      body.name?.trim() ?? "",
      body.description?.trim() ?? null,
      body.address?.trim() ?? "",
      body.city?.trim() ?? null,
      body.phone?.trim() ?? "",
      body.email?.trim() ?? "",
      userId
    )
    .run();

  return NextResponse.json({ ok: true });
}

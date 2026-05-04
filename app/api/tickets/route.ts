export const runtime = "edge";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { env } = getRequestContext();
  const db: D1Database = env.DB;

  const { results } = await db
    .prepare(`SELECT * FROM ticket_packages ORDER BY created_at DESC`)
    .all();

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const { env } = getRequestContext();
  const db: D1Database = env.DB;

  const body = await request.json() as {
    name: string;
    total_sessions: number;
    validity_days: number;
    price: number;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  const id = crypto.randomUUID();

  await db
    .prepare(
      `INSERT INTO ticket_packages (id, name, total_sessions, validity_days, price, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`
    )
    .bind(id, body.name.trim(), body.total_sessions, body.validity_days, body.price)
    .run();

  return NextResponse.json({ id }, { status: 201 });
}

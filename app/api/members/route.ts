export const runtime = "edge";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { env } = getRequestContext();
  const db: D1Database = env.DB;

  const { results } = await db
    .prepare(
      `SELECT id, full_name, email, phone, status, joined_at,
       (SELECT COUNT(*) FROM member_tickets mt WHERE mt.member_id = members.id AND mt.status = 'active') AS tickets_active
       FROM members ORDER BY created_at DESC`
    )
    .all();

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const { env } = getRequestContext();
  const db: D1Database = env.DB;

  const body = await request.json() as {
    full_name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    emergency_contact?: string;
    emergency_phone?: string;
  };

  if (!body.full_name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "Nombre y email son obligatorios" }, { status: 400 });
  }

  const id = crypto.randomUUID();

  await db
    .prepare(
      `INSERT INTO members (id, user_id, email, full_name, phone, date_of_birth, emergency_contact, emergency_phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`
    )
    .bind(
      id,
      body.email, // user_id temporal hasta integrar auth
      body.email.trim(),
      body.full_name.trim(),
      body.phone || null,
      body.date_of_birth || null,
      body.emergency_contact || null,
      body.emergency_phone || null
    )
    .run();

  return NextResponse.json({ id }, { status: 201 });
}

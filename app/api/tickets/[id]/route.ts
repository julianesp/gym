export const runtime = "edge";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { env } = getRequestContext();
  const db: D1Database = env.DB;
  const { id } = await params;

  const body = await request.json() as {
    name: string;
    total_sessions: number;
    validity_days: number;
    price: number;
  };

  await db
    .prepare(
      `UPDATE ticket_packages SET name=?, total_sessions=?, validity_days=?, price=?, updated_at=datetime('now') WHERE id=?`
    )
    .bind(body.name.trim(), body.total_sessions, body.validity_days, body.price, id)
    .run();

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { env } = getRequestContext();
  const db: D1Database = env.DB;
  const { id } = await params;

  await db.prepare(`DELETE FROM ticket_packages WHERE id=?`).bind(id).run();

  return NextResponse.json({ success: true });
}

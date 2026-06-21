export const runtime = "edge";


import { getDB } from "@/lib/db/client";
import { getCurrentGymId, tenantErrorResponse } from "@/lib/auth/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const gymId = await getCurrentGymId();
    const db = getDB();
    const { id } = await params;

    const body = await request.json() as {
      name: string;
      total_sessions: number;
      validity_days: number;
      price: number;
    };

    const result = await db
      .prepare(
        `UPDATE ticket_packages SET name=?, total_sessions=?, validity_days=?, price=?, updated_at=datetime('now')
         WHERE id=? AND gym_id=?`
      )
      .bind(body.name.trim(), body.total_sessions, body.validity_days, body.price, id, gymId)
      .run();

    if (!result.meta.changes) {
      return NextResponse.json({ error: "Tiquetera no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return tenantErrorResponse(e);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const gymId = await getCurrentGymId();
    const db = getDB();
    const { id } = await params;

    const result = await db
      .prepare(`DELETE FROM ticket_packages WHERE id=? AND gym_id=?`)
      .bind(id, gymId)
      .run();

    if (!result.meta.changes) {
      return NextResponse.json({ error: "Tiquetera no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return tenantErrorResponse(e);
  }
}

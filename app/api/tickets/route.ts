export const runtime = "edge";


import { getDB } from "@/lib/db/client";
import { getCurrentGymId, tenantErrorResponse } from "@/lib/auth/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const gymId = await getCurrentGymId();
    const db = getDB();

    const { results } = await db
      .prepare(`SELECT * FROM ticket_packages WHERE gym_id = ? ORDER BY created_at DESC`)
      .bind(gymId)
      .all();

    return NextResponse.json(results);
  } catch (e) {
    return tenantErrorResponse(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const gymId = await getCurrentGymId();
    const db = getDB();

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
        `INSERT INTO ticket_packages (id, gym_id, name, total_sessions, validity_days, price, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`
      )
      .bind(id, gymId, body.name.trim(), body.total_sessions, body.validity_days, body.price)
      .run();

    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    return tenantErrorResponse(e);
  }
}

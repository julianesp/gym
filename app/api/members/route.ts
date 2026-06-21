export const runtime = "edge";


import { getDB } from "@/lib/db/client";
import { getCurrentGymId, tenantErrorResponse } from "@/lib/auth/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const gymId = await getCurrentGymId();
    const db = getDB();

    const { results } = await db
      .prepare(
        `SELECT id, full_name, email, phone, status, joined_at,
         (SELECT COUNT(*) FROM member_tickets mt WHERE mt.member_id = members.id AND mt.status = 'active') AS tickets_active
         FROM members WHERE gym_id = ? ORDER BY created_at DESC`
      )
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
        `INSERT INTO members (id, gym_id, user_id, email, full_name, phone, date_of_birth, emergency_contact, emergency_phone, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`
      )
      .bind(
        id,
        gymId,
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
  } catch (e) {
    return tenantErrorResponse(e);
  }
}

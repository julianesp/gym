export const runtime = "edge";

import { getDB } from "@/lib/db/client";
import { currentUser } from "@clerk/nextjs/server";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { NextRequest, NextResponse } from "next/server";

/**
 * Acciones del super admin sobre un gimnasio concreto.
 *
 * PATCH body: { action, ... }
 *   - { action: "suspend" }                      -> status = 'suspended'
 *   - { action: "reactivate" }                   -> status = 'active'
 *   - { action: "extend_trial", days: number }   -> suma días a trial_ends_at
 *   - { action: "grant_subscription", months: number } -> suscripción cortesía
 *
 * DELETE: elimina el gimnasio y todos sus datos (CASCADE).
 */

async function requireSuperAdmin() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  return isSuperAdmin(email);
}

/**
 * GET: detalle completo de un gimnasio — datos de contacto, métricas de uso
 * (miembros, tiqueteras, asistencias, ingresos del gym) e historial de
 * suscripciones. Alimenta el panel de detalle del super admin.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const db = getDB();

  const gym = await db
    .prepare(
      `SELECT id, name, description, email, phone, address, city, owner_id,
              status, trial_ends_at, created_at, updated_at
       FROM gyms WHERE id = ?`
    )
    .bind(id)
    .first<{
      id: string;
      name: string;
      description: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
      city: string | null;
      owner_id: string;
      status: string;
      trial_ends_at: string | null;
      created_at: string;
      updated_at: string;
    }>();

  if (!gym) {
    return NextResponse.json({ error: "Gimnasio no encontrado" }, { status: 404 });
  }

  // Métricas de uso en una sola pasada por tabla.
  const metrics = await db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM members WHERE gym_id = ?1) AS members,
         (SELECT COUNT(*) FROM members WHERE gym_id = ?1 AND status = 'active') AS active_members,
         (SELECT COUNT(*) FROM ticket_packages WHERE gym_id = ?1) AS packages,
         (SELECT COUNT(*) FROM member_tickets WHERE gym_id = ?1) AS tickets_sold,
         (SELECT COUNT(*) FROM attendances WHERE gym_id = ?1) AS attendances_total,
         (SELECT COUNT(*) FROM attendances WHERE gym_id = ?1
            AND check_in_time >= datetime('now', '-30 days')) AS attendances_30d,
         (SELECT COALESCE(SUM(payment_amount), 0) FROM member_tickets
            WHERE gym_id = ?1 AND payment_status = 'paid') AS gym_revenue`
    )
    .bind(id)
    .first<{
      members: number;
      active_members: number;
      packages: number;
      tickets_sold: number;
      attendances_total: number;
      attendances_30d: number;
      gym_revenue: number;
    }>();

  const { results: subscriptions } = await db
    .prepare(
      `SELECT id, status, started_at, expires_at
       FROM gym_subscriptions WHERE gym_id = ?
       ORDER BY started_at DESC LIMIT 20`
    )
    .bind(id)
    .all<{ id: string; status: string; started_at: string; expires_at: string | null }>();

  const now = Date.now();
  const activeSub = subscriptions.find(
    (s) => s.status === "active" && (!s.expires_at || new Date(s.expires_at).getTime() > now)
  );
  const trialActive =
    !activeSub && !!gym.trial_ends_at && new Date(gym.trial_ends_at).getTime() > now;

  return NextResponse.json({
    gym: {
      ...gym,
      suspended: gym.status === "suspended",
      state: activeSub ? "subscribed" : trialActive ? "trial" : "expired",
      subExpiresAt: activeSub?.expires_at ?? null,
    },
    metrics,
    subscriptions,
  });
}

type Action =
  | { action: "suspend" }
  | { action: "reactivate" }
  | { action: "extend_trial"; days: number }
  | { action: "grant_subscription"; months: number };

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const db = getDB();

  const gym = await db
    .prepare(`SELECT id, trial_ends_at FROM gyms WHERE id = ?`)
    .bind(id)
    .first<{ id: string; trial_ends_at: string | null }>();

  if (!gym) {
    return NextResponse.json({ error: "Gimnasio no encontrado" }, { status: 404 });
  }

  const body = (await request.json()) as Action;

  switch (body.action) {
    case "suspend": {
      await db
        .prepare(`UPDATE gyms SET status = 'suspended', updated_at = datetime('now') WHERE id = ?`)
        .bind(id)
        .run();
      return NextResponse.json({ ok: true, status: "suspended" });
    }

    case "reactivate": {
      await db
        .prepare(`UPDATE gyms SET status = 'active', updated_at = datetime('now') WHERE id = ?`)
        .bind(id)
        .run();
      return NextResponse.json({ ok: true, status: "active" });
    }

    case "extend_trial": {
      const days = Number(body.days);
      if (!Number.isFinite(days) || days <= 0 || days > 365) {
        return NextResponse.json({ error: "Días inválidos (1–365)" }, { status: 400 });
      }
      // Extendemos desde la fecha actual de vencimiento si sigue futura, o desde hoy.
      const now = Date.now();
      const base =
        gym.trial_ends_at && new Date(gym.trial_ends_at).getTime() > now
          ? new Date(gym.trial_ends_at).getTime()
          : now;
      const newEnd = new Date(base + days * 24 * 60 * 60 * 1000).toISOString();
      await db
        .prepare(`UPDATE gyms SET trial_ends_at = ?, updated_at = datetime('now') WHERE id = ?`)
        .bind(newEnd, id)
        .run();
      return NextResponse.json({ ok: true, trialEndsAt: newEnd });
    }

    case "grant_subscription": {
      const months = Number(body.months);
      if (!Number.isFinite(months) || months <= 0 || months > 36) {
        return NextResponse.json({ error: "Meses inválidos (1–36)" }, { status: 400 });
      }
      // Suscripción cortesía: extiende sobre la vigente si la hay, o desde hoy.
      const now = Date.now();
      const current = await db
        .prepare(
          `SELECT expires_at FROM gym_subscriptions
           WHERE gym_id = ? AND status = 'active'
           ORDER BY started_at DESC LIMIT 1`
        )
        .bind(id)
        .first<{ expires_at: string | null }>();
      const base =
        current?.expires_at && new Date(current.expires_at).getTime() > now
          ? new Date(current.expires_at).getTime()
          : now;
      const expiresAt = new Date(base + months * 30 * 24 * 60 * 60 * 1000).toISOString();
      await db
        .prepare(
          `INSERT INTO gym_subscriptions (id, gym_id, status, started_at, expires_at)
           VALUES (?, ?, 'active', datetime('now'), ?)`
        )
        .bind(`grant_${crypto.randomUUID()}`, id, expiresAt)
        .run();
      return NextResponse.json({ ok: true, expiresAt });
    }

    default:
      return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const db = getDB();

  const result = await db.prepare(`DELETE FROM gyms WHERE id = ?`).bind(id).run();

  if (!result.meta.changes) {
    return NextResponse.json({ error: "Gimnasio no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, deleted: true });
}

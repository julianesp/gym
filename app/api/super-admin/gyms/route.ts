export const runtime = "edge";

import { getDB } from "@/lib/db/client";
import { currentUser } from "@clerk/nextjs/server";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { NextRequest, NextResponse } from "next/server";

const MONTHLY_PRICE = 39900; // COP — precio de la suscripción GymSaaS

type GymRow = {
  id: string;
  name: string;
  email: string | null;
  owner_id: string;
  status: string;
  trial_ends_at: string | null;
  created_at: string;
  members_count: number;
  active_subs: number;
  sub_expires_at: string | null;
};

/**
 * Panel super admin: lista todos los gimnasios del sistema con su número de
 * miembros y el estado de su suscripción. Solo accesible por el SUPER_ADMIN.
 *
 * Query params:
 *   - q: búsqueda por nombre o email
 *   - state: "all" | "subscribed" | "trial" | "expired" | "suspended"
 */
export async function GET(request: NextRequest) {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!isSuperAdmin(email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const stateFilter = url.searchParams.get("state") ?? "all";

  const db = getDB();

  const { results } = await db
    .prepare(
      `SELECT
         g.id, g.name, g.email, g.owner_id, g.status, g.trial_ends_at, g.created_at,
         (SELECT COUNT(*) FROM members m WHERE m.gym_id = g.id) AS members_count,
         (SELECT COUNT(*) FROM gym_subscriptions s
            WHERE s.gym_id = g.id AND s.status = 'active'
            AND (s.expires_at IS NULL OR s.expires_at > datetime('now'))) AS active_subs,
         (SELECT s.expires_at FROM gym_subscriptions s
            WHERE s.gym_id = g.id AND s.status = 'active'
            ORDER BY s.started_at DESC LIMIT 1) AS sub_expires_at
       FROM gyms g
       ORDER BY g.created_at DESC`
    )
    .all<GymRow>();

  const now = Date.now();

  const allGyms = results.map((g) => {
    const subscribed = g.active_subs > 0;
    const trialActive =
      !subscribed &&
      !!g.trial_ends_at &&
      new Date(g.trial_ends_at).getTime() > now;

    const state: "subscribed" | "trial" | "expired" = subscribed
      ? "subscribed"
      : trialActive
      ? "trial"
      : "expired";

    return {
      id: g.id,
      name: g.name,
      email: g.email,
      members: g.members_count,
      state,
      suspended: g.status === "suspended",
      trialEndsAt: g.trial_ends_at,
      subExpiresAt: g.sub_expires_at,
      createdAt: g.created_at,
    };
  });

  // KPIs sobre TODOS los gimnasios (no afectados por los filtros de la tabla).
  const subscribedCount = allGyms.filter((g) => g.state === "subscribed").length;
  const summary = {
    totalGyms: allGyms.length,
    totalMembers: allGyms.reduce((sum, g) => sum + g.members, 0),
    subscribedGyms: subscribedCount,
    trialGyms: allGyms.filter((g) => g.state === "trial").length,
    expiredGyms: allGyms.filter((g) => g.state === "expired").length,
    suspendedGyms: allGyms.filter((g) => g.suspended).length,
    monthlyRevenue: subscribedCount * MONTHLY_PRICE,
  };

  // Aplicamos búsqueda + filtro de estado a la lista devuelta.
  const gyms = allGyms.filter((g) => {
    if (q) {
      const haystack = `${g.name} ${g.email ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (stateFilter === "all") return true;
    if (stateFilter === "suspended") return g.suspended;
    return g.state === stateFilter;
  });

  return NextResponse.json({ summary, gyms });
}

import { auth } from "@clerk/nextjs/server";
import { getDB } from "@/lib/db/client";

/**
 * Resuelve el contexto multi-tenant del request actual.
 *
 * A partir del `userId` de Clerk busca el gimnasio del que es dueño
 * (`gyms.owner_id`) y devuelve su `id`. Toda API que toque datos de un
 * gimnasio DEBE filtrar por este `gymId` para aislar a cada tenant.
 *
 * Lanza errores tipados (`TenantError`) que las rutas convierten en
 * respuestas HTTP 401 / 403.
 */

export type TenantContext = {
  userId: string;
  gymId: string;
  /** Estado de la suscripción/trial del gym. */
  subscription: SubscriptionStatus;
};

export type SubscriptionStatus = {
  /** true si el gym puede operar (trial vigente o suscripción activa). */
  active: boolean;
  /** "trial" | "subscribed" | "expired" */
  state: "trial" | "subscribed" | "expired";
  trialEndsAt: string | null;
  expiresAt: string | null;
};

export class TenantError extends Error {
  constructor(
    message: string,
    public status: 401 | 403,
    public code: "UNAUTHENTICATED" | "NO_GYM" | "SUBSCRIPTION_EXPIRED" | "GYM_SUSPENDED"
  ) {
    super(message);
    this.name = "TenantError";
  }
}

type GymRow = {
  id: string;
  status: string;
  trial_ends_at: string | null;
};

type SubRow = {
  status: string;
  expires_at: string | null;
};

/**
 * Devuelve el `gym_id` del usuario autenticado.
 * No valida suscripción — úsalo cuando solo necesitas aislar datos.
 *
 * @throws TenantError 401 si no hay sesión, 403 si el usuario no tiene gym.
 */
export async function getCurrentGymId(): Promise<string> {
  const { gymId } = await getTenantContext({ requireActiveSubscription: false });
  return gymId;
}

/**
 * Devuelve el contexto completo del tenant: userId, gymId y suscripción.
 *
 * @param opts.requireActiveSubscription si es true (por defecto), lanza
 *   TenantError 403 cuando el trial venció y no hay suscripción activa.
 */
export async function getTenantContext(
  opts: { requireActiveSubscription?: boolean } = {}
): Promise<TenantContext> {
  const requireActive = opts.requireActiveSubscription ?? true;

  const { userId } = await auth();
  if (!userId) {
    throw new TenantError("No autenticado", 401, "UNAUTHENTICATED");
  }

  const db = getDB();

  const gym = await db
    .prepare(`SELECT id, status, trial_ends_at FROM gyms WHERE owner_id = ?`)
    .bind(userId)
    .first<GymRow>();

  if (!gym) {
    throw new TenantError(
      "El usuario no tiene un gimnasio registrado",
      403,
      "NO_GYM"
    );
  }

  // Un gimnasio suspendido por el admin queda bloqueado siempre.
  if (gym.status === "suspended") {
    throw new TenantError(
      "El gimnasio ha sido suspendido. Contacta al soporte de GymSaaS.",
      403,
      "GYM_SUSPENDED"
    );
  }

  const subscription = await resolveSubscription(db, gym);

  if (requireActive && !subscription.active) {
    throw new TenantError(
      "La suscripción del gimnasio ha vencido",
      403,
      "SUBSCRIPTION_EXPIRED"
    );
  }

  return { userId, gymId: gym.id, subscription };
}

async function resolveSubscription(
  db: D1Database,
  gym: GymRow
): Promise<SubscriptionStatus> {
  const now = Date.now();

  // 1) ¿Hay una suscripción de pago activa y no vencida?
  const sub = await db
    .prepare(
      `SELECT status, expires_at FROM gym_subscriptions
       WHERE gym_id = ? AND status = 'active'
       ORDER BY started_at DESC LIMIT 1`
    )
    .bind(gym.id)
    .first<SubRow>();

  if (sub) {
    const notExpired = !sub.expires_at || new Date(sub.expires_at).getTime() > now;
    if (notExpired) {
      return {
        active: true,
        state: "subscribed",
        trialEndsAt: gym.trial_ends_at,
        expiresAt: sub.expires_at,
      };
    }
  }

  // 2) Sin suscripción: ¿sigue vigente el trial?
  const trialActive =
    !!gym.trial_ends_at && new Date(gym.trial_ends_at).getTime() > now;

  return {
    active: trialActive,
    state: trialActive ? "trial" : "expired",
    trialEndsAt: gym.trial_ends_at,
    expiresAt: sub?.expires_at ?? null,
  };
}

/**
 * Convierte un TenantError en un Response JSON. Las rutas hacen:
 *   try { ... } catch (e) { return tenantErrorResponse(e); }
 */
export function tenantErrorResponse(error: unknown): Response {
  if (error instanceof TenantError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }
  throw error; // no es un error de tenant: que lo maneje el caller
}

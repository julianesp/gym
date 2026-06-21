export const runtime = "edge";


import { getRequestContext } from "@cloudflare/next-on-pages";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Devuelve la config de pago pública del gym (sin llaves privadas)
// para que el miembro pueda pagar su tiquetera
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const gymId = request.nextUrl.searchParams.get("gymId");
  if (!gymId) return NextResponse.json({ error: "gymId requerido" }, { status: 400 });

  const { env } = getRequestContext();
  const db: D1Database = (env as unknown as { DB: D1Database }).DB;

  const config = await db
    .prepare(
      `SELECT epayco_public_key, nequi_number, accepts_epayco, accepts_nequi
       FROM gym_payment_config WHERE gym_id = ?`
    )
    .bind(gymId)
    .first<{
      epayco_public_key: string | null;
      nequi_number: string | null;
      accepts_epayco: number;
      accepts_nequi: number;
    }>();

  if (!config) return NextResponse.json({ config: null });

  // Nunca exponer la llave privada al cliente
  return NextResponse.json({
    config: {
      epaycoPublicKey: config.epayco_public_key,
      nequiNumber: config.nequi_number,
      acceptsEpayco: config.accepts_epayco === 1,
      acceptsNequi: config.accepts_nequi === 1,
    },
  });
}

// Crea una sesión de pago ePayco usando las llaves del gym (no las de GymSaaS)
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json() as {
    gymId: string;
    packageId: string;
    packageName: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    customerCity: string;
    customerRegion: string;
    customerTypeDoc: string;
    customerNumberDoc: string;
  };

  const { env } = getRequestContext();
  const db: D1Database = (env as unknown as { DB: D1Database }).DB;

  // Obtener llaves del gym
  const config = await db
    .prepare(
      `SELECT epayco_public_key, epayco_private_key, accepts_epayco
       FROM gym_payment_config WHERE gym_id = ?`
    )
    .bind(body.gymId)
    .first<{
      epayco_public_key: string | null;
      epayco_private_key: string | null;
      accepts_epayco: number;
    }>();

  if (!config?.accepts_epayco || !config.epayco_public_key) {
    return NextResponse.json({ error: "Este gimnasio no tiene ePayco configurado" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const reference = `MT-${body.gymId.slice(0, 6)}-${Date.now()}`;

  const epaycoConfig = {
    key: config.epayco_public_key,
    test: process.env.EPAYCO_TEST === "true",
    invoice: reference,
    amount: String(body.amount),
    tax: "0",
    tax_base: String(body.amount),
    currency: "COP",
    name_billing: body.customerName,
    address_billing: body.customerAddress,
    type_doc_billing: body.customerTypeDoc,
    number_doc_billing: body.customerNumberDoc,
    mobilephone_billing: body.customerPhone,
    email_billing: body.customerEmail,
    city_billing: body.customerCity,
    department_billing: body.customerRegion,
    country_billing: "CO",
    description: `Tiquetera: ${body.packageName}`,
    response: `${appUrl}/dashboard/tickets?pago=respuesta`,
    confirmation: `${appUrl}/api/gym/member-payment/confirmation?gymId=${body.gymId}`,
    lang: "es",
    autoclick: false,
    external: false,
    extra1: body.gymId,
    extra2: body.packageId,
    extra3: userId,
  };

  return NextResponse.json({ config: epaycoConfig, reference });
}

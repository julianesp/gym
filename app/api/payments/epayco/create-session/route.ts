export const runtime = "edge";

import { getCurrentGymId, tenantErrorResponse } from "@/lib/auth/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // El pago corresponde al gym del usuario autenticado. Resolvemos el id real
    // (no confiamos en datos del cliente) para poder activarlo en el webhook.
    const gymId = await getCurrentGymId();

    const body = await request.json() as {
      gymName: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      customerAddress: string;
      customerCity: string;
      customerRegion: string;
      customerTypeDoc: string;
      customerNumberDoc: string;
      reference: string;
    };

    const publicKey = process.env.EPAYCO_PUBLIC_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://gymsaas.vercel.app";

    if (!publicKey) {
      return NextResponse.json({ error: "Pasarela de pagos no configurada" }, { status: 500 });
    }

    const config = {
      key: publicKey,
      test: process.env.EPAYCO_TEST === "true",
      invoice: body.reference,
      amount: "39900",
      tax: "0",
      tax_base: "39900",
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
      description: `Suscripción mensual GymSaaS - ${body.gymName}`,
      response: `${appUrl}/suscripcion/respuesta`,
      confirmation: `${appUrl}/api/payments/epayco/confirmation`,
      lang: "es",
      autoclick: false,
      external: false,
      extra1: body.gymName,
      extra2: gymId, // id real del gym — lo usa el webhook para activar la suscripción
    };

    return NextResponse.json({ config });
  } catch (e) {
    return tenantErrorResponse(e);
  }
}

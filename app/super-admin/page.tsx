import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/auth/permissions";
import SuperAdminClient from "./SuperAdminClient";

export const runtime = "edge";

export default async function SuperAdminPage() {
  // Guard server-side: solo el SUPER_ADMIN puede ver el panel.
  // No dependemos del middleware (que requiere el claim `email` en el JWT de Clerk);
  // currentUser() es la fuente confiable del email.
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!isSuperAdmin(email)) {
    redirect("/unauthorized");
  }

  return <SuperAdminClient />;
}

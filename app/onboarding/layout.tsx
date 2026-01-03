import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar autenticación básica
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Permitir acceso al onboarding sin verificaciones adicionales
  return <>{children}</>;
}

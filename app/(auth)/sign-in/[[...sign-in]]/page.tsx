import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-500 mb-2">GymSaaS</h1>
          <p className="text-gray-400">Gestión inteligente para tu gimnasio</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-gray-900 border border-gray-800",
            }
          }}
        />
      </div>
    </div>
  );
}

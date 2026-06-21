import type { NextConfig } from "next";

// Habilita los bindings de Cloudflare (D1, etc.) durante `next dev`.
// Solo se ejecuta en desarrollo; en build/producción Cloudflare los inyecta.
if (process.env.NODE_ENV === "development") {
  import("@cloudflare/next-on-pages/next-dev").then(({ setupDevPlatform }) => {
    setupDevPlatform().catch((e) => console.error("setupDevPlatform error:", e));
  });
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["@cloudflare/next-on-pages", "wrangler", "miniflare"],
  webpack: (config) => {
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : []),
      ({ request }: { request?: string }, callback: (e?: Error | null, r?: string) => void) => {
        if (!request) return callback();
        if (
          request.startsWith("node:") ||
          /\/(wrangler|miniflare|blake3-wasm|workerd|esbuild|detect-libc|youch|@cspotcode)/.test(request)
        ) {
          return callback(null, `commonjs ${request}`);
        }
        callback();
      },
    ];
    return config;
  },
};


export default nextConfig;

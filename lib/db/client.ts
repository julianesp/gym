import { getRequestContext } from "@cloudflare/next-on-pages";

export function getDB(): D1Database {
  const { env } = getRequestContext();
  return env.DB;
}

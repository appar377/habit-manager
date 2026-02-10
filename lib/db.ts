import { neon } from "@neondatabase/serverless";

let client: ReturnType<typeof neon> | null = null;

function getClient() {
  if (client) return client;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  client = neon(databaseUrl);
  return client;
}

export const sql: ReturnType<typeof neon> = ((strings, ...values) => {
  const c = getClient();
  // @neondatabase/serverless sql tag function
  return (c as any)(strings as any, ...values);
}) as ReturnType<typeof neon>;

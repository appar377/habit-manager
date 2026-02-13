import { sql } from "@/lib/db";
import { ensureSchema } from "@/lib/db/migrations";

export { ensureSchema };

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateFriendCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function createUniqueFriendCode(): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const code = generateFriendCode();
    const exists = (await sql`SELECT 1 FROM users WHERE friend_code = ${code} LIMIT 1;`) as { "?column?": number }[];
    if (exists.length === 0) return code;
  }
  return generateFriendCode();
}

export function normalizeFriendCode(code: string): string {
  return code.trim().toUpperCase();
}

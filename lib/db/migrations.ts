import { sql } from "@/lib/db";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const SCHEMA_DIR = path.join(process.cwd(), "db", "schema");
const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");
let schemaReady: Promise<void> | null = null;

type MigrationEntry = {
  id: string;
  checksum: string;
};

function checksumOf(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function listSqlFiles(dir: string) {
  try {
    const files = await readdir(dir);
    return files.filter((file) => file.endsWith(".sql")).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

async function ensureMigrationsTable() {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getMigrationEntry(id: string): Promise<MigrationEntry | null> {
  const res = await sql.query("SELECT id, checksum FROM schema_migrations WHERE id = $1 LIMIT 1;", [id]);
  const rows = Array.isArray(res) ? res : (res as any).rows;
  return rows?.[0] ?? null;
}

async function recordMigration(id: string, checksum: string) {
  await sql.query("INSERT INTO schema_migrations (id, checksum) VALUES ($1, $2);", [id, checksum]);
}

/** 複数文のSQLを1文ずつに分割（PostgreSQLは prepared statement で1コマンドのみ受け付けるため） */
function splitSqlStatements(content: string): string[] {
  return content
    .split(/;\s*[\r\n]+/)
    .map((s) => s.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "").trim())
    .filter((s) => s.length > 0);
}

async function applyFile(dir: string, file: string, prefix: string) {
  const content = await readFile(path.join(dir, file), "utf8");
  const id = `${prefix}:${file}`;
  const checksum = checksumOf(content);
  const existing = await getMigrationEntry(id);
  if (existing) {
    if (existing.checksum !== checksum) {
      throw new Error(`schema_changed:${file}`);
    }
    return;
  }
  const statements = splitSqlStatements(content);
  for (const statement of statements) {
    const withSemicolon = statement.endsWith(";") ? statement : statement + ";";
    await sql.query(withSemicolon);
  }
  await recordMigration(id, checksum);
}

async function applySchemaFiles() {
  const files = await listSqlFiles(SCHEMA_DIR);
  for (const file of files) {
    await applyFile(SCHEMA_DIR, file, "schema");
  }
}

async function applyMigrationFiles() {
  const files = await listSqlFiles(MIGRATIONS_DIR);
  for (const file of files) {
    await applyFile(MIGRATIONS_DIR, file, "migration");
  }
}

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await ensureMigrationsTable();
      await applySchemaFiles();
      await applyMigrationFiles();
    })();
  }
  await schemaReady;
}

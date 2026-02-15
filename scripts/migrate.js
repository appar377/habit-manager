/* eslint-disable no-console */
const { neon } = require("@neondatabase/serverless");
const { readdir, readFile } = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const SCHEMA_DIR = path.join(process.cwd(), "db", "schema");
const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");

function checksumOf(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

/** Split SQL into single statements (Neon prepared statement allows one command). Skip splitting inside $$...$$ */
function splitSqlStatements(content) {
  const stripped = content
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const statements = [];
  let start = 0;
  let inDollarQuote = false;
  for (let i = 0; i < stripped.length; i++) {
    if (inDollarQuote) {
      if (stripped.slice(i, i + 2) === "$$") {
        inDollarQuote = false;
        i += 1;
      }
      continue;
    }
    if (stripped.slice(i, i + 2) === "$$") {
      inDollarQuote = true;
      i += 1;
      continue;
    }
    const match = stripped.slice(i).match(/^\s*;\s*[\r\n]+/);
    if (match) {
      const stmt = stripped.slice(start, i).trim();
      if (stmt.length > 0) statements.push(stmt);
      start = i + match[0].length;
      i += match[0].length - 1;
    }
  }
  const tail = stripped.slice(start).trim();
  if (tail.length > 0) statements.push(tail);
  return statements;
}

async function listSqlFiles(dir) {
  try {
    const files = await readdir(dir);
    return files.filter((file) => file.endsWith(".sql")).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  const sql = neon(databaseUrl);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  async function getMigrationEntry(id) {
    const res = await sql.query("SELECT id, checksum FROM schema_migrations WHERE id = $1 LIMIT 1;", [id]);
    const rows = Array.isArray(res) ? res : (res && res.rows);
    return rows?.[0] ?? null;
  }

  async function recordMigration(id, checksum) {
    await sql.query("INSERT INTO schema_migrations (id, checksum) VALUES ($1, $2);", [id, checksum]);
  }

  async function applyFile(dir, file, prefix) {
    const content = await readFile(path.join(dir, file), "utf8");
    const id = `${prefix}:${file}`;
    const checksum = checksumOf(content);
    const existing = await getMigrationEntry(id);
    if (existing) {
      if (existing.checksum !== checksum) {
        throw new Error(`schema_changed:${file}`);
      }
      console.log(`skip ${id}`);
      return;
    }
    const statements = splitSqlStatements(content);
    for (const stmt of statements) {
      const withSemicolon = stmt.endsWith(";") ? stmt : stmt + ";";
      await sql.query(withSemicolon);
    }
    await recordMigration(id, checksum);
    console.log(`applied ${id}`);
  }

  const schemaFiles = await listSqlFiles(SCHEMA_DIR);
  for (const file of schemaFiles) {
    await applyFile(SCHEMA_DIR, file, "schema");
  }

  const migrationFiles = await listSqlFiles(MIGRATIONS_DIR);
  for (const file of migrationFiles) {
    await applyFile(MIGRATIONS_DIR, file, "migration");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

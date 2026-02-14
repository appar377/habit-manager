import { sql } from "@/lib/db";

export type QueryResult<T> = { rows?: T[] } | T[];

function rowsOf<T>(res: QueryResult<T>): T[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object" && Array.isArray(res.rows)) return res.rows;
  return [];
}

/** sql.query の戻り値は実行時に rows または配列になるが型定義が合わないためキャスト用 */
function asQueryResult<T>(res: unknown): QueryResult<T> {
  return res as QueryResult<T>;
}

export type ListOptions<Row> = {
  orderBy?: keyof Row;
  order?: "ASC" | "DESC";
  limit?: number;
  offset?: number;
};

export class BaseModel<Row extends Record<string, any>> {
  constructor(
    protected readonly table: string,
    protected readonly columns: readonly string[],
    protected readonly primaryKey: string = "id"
  ) {}

  protected assertColumns(keys: string[]) {
    for (const key of keys) {
      if (!this.columns.includes(key)) {
        throw new Error(`invalid_column:${this.table}.${key}`);
      }
    }
  }

  protected columnList() {
    return this.columns.join(", ");
  }

  protected buildWhere(where?: Partial<Row>) {
    const keys = Object.keys(where ?? {});
    if (keys.length === 0) return { clause: "", values: [] as any[] };
    this.assertColumns(keys);
    const clause = keys.map((key, index) => `${key} = $${index + 1}`).join(" AND ");
    const values = keys.map((key) => (where as any)[key]);
    return { clause: `WHERE ${clause}`, values };
  }

  async findById(id: string): Promise<Row | null> {
    const query = `SELECT ${this.columnList()} FROM ${this.table} WHERE ${this.primaryKey} = $1 LIMIT 1;`;
    const res = await sql.query(query, [id]);
    const rows = rowsOf<Row>(asQueryResult<Row>(res));
    return rows[0] ?? null;
  }

  async findOne(where: Partial<Row>): Promise<Row | null> {
    const { clause, values } = this.buildWhere(where);
    const query = `SELECT ${this.columnList()} FROM ${this.table} ${clause} LIMIT 1;`;
    const res = await sql.query(query, values);
    const rows = rowsOf<Row>(asQueryResult<Row>(res));
    return rows[0] ?? null;
  }

  async list(where?: Partial<Row>, options?: ListOptions<Row>): Promise<Row[]> {
    const { clause, values } = this.buildWhere(where);
    const orderBy = options?.orderBy ? String(options.orderBy) : undefined;
    if (orderBy) this.assertColumns([orderBy]);
    const order = options?.order ?? "ASC";
    const orderClause = orderBy ? `ORDER BY ${orderBy} ${order}` : "";
    const limitClause = options?.limit ? `LIMIT ${options.limit}` : "";
    const offsetClause = options?.offset ? `OFFSET ${options.offset}` : "";
    const query = `SELECT ${this.columnList()} FROM ${this.table} ${clause} ${orderClause} ${limitClause} ${offsetClause};`;
    const res = await sql.query(query, values);
    return rowsOf<Row>(asQueryResult<Row>(res));
  }

  async insert(data: Partial<Row>): Promise<Row> {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      throw new Error(`insert_empty:${this.table}`);
    }
    this.assertColumns(keys);
    const values = keys.map((key) => (data as any)[key]);
    const cols = keys.join(", ");
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
    const query = `INSERT INTO ${this.table} (${cols}) VALUES (${placeholders}) RETURNING ${this.columnList()};`;
    const res = await sql.query(query, values);
    const rows = rowsOf<Row>(asQueryResult<Row>(res));
    if (!rows[0]) throw new Error(`insert_failed:${this.table}`);
    return rows[0];
  }

  async updateById(id: string, patch: Partial<Row>): Promise<Row | null> {
    const keys = Object.keys(patch);
    if (keys.length === 0) return this.findById(id);
    this.assertColumns(keys);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const values = keys.map((key) => (patch as any)[key]);
    values.push(id);
    const query = `UPDATE ${this.table} SET ${setClause} WHERE ${this.primaryKey} = $${keys.length + 1} RETURNING ${this.columnList()};`;
    const res = await sql.query(query, values);
    const rows = rowsOf<Row>(asQueryResult<Row>(res));
    return rows[0] ?? null;
  }

  async deleteById(id: string): Promise<number> {
    const query = `DELETE FROM ${this.table} WHERE ${this.primaryKey} = $1;`;
    const res = await sql.query(query, [id]);
    const rowCount = (res as any).rowCount;
    return typeof rowCount === "number" ? rowCount : 0;
  }
}

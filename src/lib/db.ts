import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export interface DbClient {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
}

export const db: DbClient = {
  async query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
    return pool.query<T>(text, params);
  },
};

export default db;

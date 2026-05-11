import { createClient, SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Supabase client — singleton, server-side only (service role key bypasses RLS)
// ---------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var _supabase: SupabaseClient | undefined;
}

function createSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

const supabase: SupabaseClient =
  process.env.NODE_ENV === 'development'
    ? (globalThis._supabase ?? (globalThis._supabase = createSupabase()))
    : createSupabase();

export { supabase };
export default supabase;

// ---------------------------------------------------------------------------
// execute() — INSERT / UPDATE / DELETE
// Calls the `supabase_execute` RPC defined in schema.sql.
// Converts ? placeholders to $1, $2, … automatically.
// ---------------------------------------------------------------------------
export async function execute(sql: string, params: any[] = []): Promise<any> {
  const pgSql = addTypeCasts(toPositional(sql), params);
  const { data, error } = await supabase.rpc('supabase_execute', {
    query_text: pgSql,
    query_params: params.map(String),
  });
  if (error) throw new Error(`DB execute error: ${error.message}\nSQL: ${pgSql}`);
  return data;
}

// ---------------------------------------------------------------------------
// query() — SELECT
// Calls the `supabase_query` RPC defined in schema.sql.
// Returns all rows, or a single row when one=true.
// ---------------------------------------------------------------------------
export async function query<T = any>(
  sql: string,
  params: any[] = [],
  one = false
): Promise<any> {
  const pgSql = addTypeCasts(toPositional(sql), params);
  const { data, error } = await supabase.rpc('supabase_query', {
    query_text: pgSql,
    query_params: params.map(String),
  });
  if (error) throw new Error(`DB query error: ${error.message}\nSQL: ${pgSql}`);
  const rows = (data ?? []) as T[];
  return one ? (rows[0] ?? null) : rows;
}

/** Replace ? placeholders with PostgreSQL $1, $2, … */
function toPositional(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

/**
 * Add explicit PG type casts to $N placeholders when the corresponding
 * JS param is a number — fixes "operator does not exist: integer = text".
 */
function addTypeCasts(sql: string, params: any[]): string {
  return sql.replace(/\$(\d+)/g, (match, numStr) => {
    const idx = parseInt(numStr, 10) - 1;
    if (idx < params.length) {
      const val = params[idx];
      if (typeof val === 'number' && Number.isInteger(val)) return `$${numStr}::bigint`;
      if (typeof val === 'number') return `$${numStr}::numeric`;
    }
    return match;
  });
}

// ---------------------------------------------------------------------------
// Password utilities
// ---------------------------------------------------------------------------
export function checkPassword(password: string, hash: string): boolean {
  if (hash.startsWith('$2')) return bcrypt.compareSync(password, hash);
  const parts = hash.split('$');
  if (parts.length !== 3) return false;
  const [methodPart, salt, storedHex] = parts;
  const mp = methodPart.split(':');
  if (mp.length < 3 || mp[0] !== 'pbkdf2') return false;
  try {
    const derived = crypto
      .pbkdf2Sync(
        Buffer.from(password),
        Buffer.from(salt),
        parseInt(mp[2], 10),
        Math.floor(storedHex.length / 2),
        mp[1]
      )
      .toString('hex');
    return derived === storedHex;
  } catch {
    return false;
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

// ---------------------------------------------------------------------------
// initDb() — no-op for Supabase. Schema is applied via schema.sql in the
// Supabase SQL editor. Admin users are added directly via SQL.
// ---------------------------------------------------------------------------
export async function initDb(): Promise<void> {
  // No-op: Supabase schema and seed data managed externally.
}

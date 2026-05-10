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
  const pgSql = toPositional(sql);
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
  const pgSql = toPositional(sql);
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
// initDb() — seeds data if the users table is empty.
// Schema (tables + RPC functions) MUST be applied first via schema.sql.
// ---------------------------------------------------------------------------
export async function initDb(): Promise<void> {
  const { data: countData } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true });

  // countData is null for head=true; use count from response
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  if ((count ?? 0) > 0) return;

  const COHORT_START = new Date('2026-03-22');
  const nowIso = () => new Date().toISOString().slice(0, 16).replace('T', ' ');

  const seedUsers = [
    { name: 'Admin', email: 'admin@evolvex.in', pwd: 'admin', role: 'admin', proj: 'EvolveX HQ', pub: 0, feat: 0 },
    { name: 'Lakshmi', email: 'lakshmi@evolvex.in', pwd: 'student', role: 'student', proj: 'EvolveX Project', pub: 1, feat: 1 },
    { name: 'Ananya', email: 'ananya@evolvex.in', pwd: 'student', role: 'student', proj: 'EvolveX Project', pub: 1, feat: 0 },
    { name: 'Rahul', email: 'rahul@evolvex.in', pwd: 'student', role: 'student', proj: 'EvolveX Project', pub: 1, feat: 0 },
  ];

  for (const u of seedUsers) {
    await supabase.from('users').insert({
      name: u.name,
      email: u.email,
      password_hash: hashPassword(u.pwd),
      role: u.role,
      project_name: u.proj,
      one_liner: 'Building for Bharat',
      problem: '',
      project_link: 'https://linkedin.com',
      linkedin: 'https://linkedin.com',
      category: 'Other',
      stage: 'Idea',
      is_public: u.pub,
      featured: u.feat,
      quote: 'Building one step at a time.',
    });
  }

  for (let i = 1; i <= 12; i++) {
    const due = new Date(COHORT_START);
    due.setDate(due.getDate() + i * 7 - 1);
    const dueStr = due.toISOString().slice(0, 10);
    await supabase.from('tasks').insert([
      { week: i, title: `Week ${i}: Founder Progress Update`, description: 'Share what you built, validated, learnt, and what is blocked.', points: 25, due_date: dueStr },
      { week: i, title: `Week ${i}: Customer Conversation`, description: 'Speak to one target user/customer and record the insight.', points: 20, due_date: dueStr },
    ]);
  }

  const { data: lakshmi } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'lakshmi@evolvex.in')
    .single();

  if (lakshmi) {
    await supabase.from('wins').insert({
      user_id: lakshmi.id,
      title: 'Lakshmi — Student of the Week',
      description: 'Moved from idea to prototype.',
      featured: 1,
      created_at: nowIso(),
    });
  }
}

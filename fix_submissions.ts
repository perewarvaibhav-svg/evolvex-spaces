import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[match[1].trim()] = val;
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixSubmissions() {
  console.log("Fixing supabase_execute DDL issue...");
  
  // Create an RPC function that executes arbitrary SQL without USING parameters
  const createRpc = `
    CREATE OR REPLACE FUNCTION exec_sql(query_text TEXT)
    RETURNS VOID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE query_text;
    END;
    $$;
  `;

  let res = await supabase.rpc('supabase_execute', { query_text: createRpc, query_params: [] });
  // Wait, if supabase_execute fails on DDL, we can't create the RPC using supabase_execute!

  console.log("Creating RPC using standard query? No, standard query is also wrapped.");
}

fixSubmissions();

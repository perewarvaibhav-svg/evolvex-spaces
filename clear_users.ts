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

async function cleanData() {
  console.log("Removing all non-admin users and their data...");
  
  const queries = [
    `DELETE FROM submissions WHERE user_id IN (SELECT id FROM users WHERE role != 'admin');`,
    `DELETE FROM activities WHERE user_id IN (SELECT id FROM users WHERE role != 'admin');`,
    `DELETE FROM journey WHERE user_id IN (SELECT id FROM users WHERE role != 'admin');`,
    `DELETE FROM badges WHERE user_id IN (SELECT id FROM users WHERE role != 'admin');`,
    `DELETE FROM wins WHERE user_id IN (SELECT id FROM users WHERE role != 'admin');`,
    `DELETE FROM attendance WHERE user_id IN (SELECT id FROM users WHERE role != 'admin');`,
    `DELETE FROM password_reset_tokens WHERE user_id IN (SELECT id FROM users WHERE role != 'admin');`,
    `DELETE FROM users WHERE role != 'admin';`
  ];

  for (const sql of queries) {
    const { error } = await supabase.rpc('supabase_execute', {
      query_text: sql,
      query_params: []
    });
    if (error) {
      console.error("Error executing:", sql);
      console.error(error);
    } else {
      console.log("Success:", sql.split(' WHERE')[0]);
    }
  }

  console.log("Cleanup complete.");
}

cleanData();

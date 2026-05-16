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

async function runMigrations() {
  console.log("Applying v2 schema...");
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      priority TEXT DEFAULT 'normal',
      author_id INTEGER,
      created_at TIMESTAMP,
      expires_at TIMESTAMP
    );`,
    
    `CREATE TABLE IF NOT EXISTS sessions_data (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      speaker TEXT,
      linkedin TEXT,
      event_date TIMESTAMP NOT NULL,
      event_type TEXT,
      photo_url TEXT,
      created_at TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP
    );`
  ];

  for (const sql of tables) {
    const { error } = await supabase.rpc('supabase_execute', {
      query_text: sql,
      query_params: []
    });
    if (error) {
      console.error("Error executing:", sql);
      console.error(error);
    } else {
      console.log("Success:", sql.split('\n')[0]);
    }
  }

  // Also try to add the missing columns to access_requests if they aren't there
  const alterColumns = [
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS requested_role TEXT DEFAULT 'student';`,
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS password_hash TEXT;`
  ];

  for (const sql of alterColumns) {
    const { error } = await supabase.rpc('supabase_execute', {
      query_text: sql,
      query_params: []
    });
    if (error) {
      console.error("Error executing:", sql);
      console.error(error);
    } else {
      console.log("Success:", sql);
    }
  }

  console.log("Migration complete.");
}

runMigrations();

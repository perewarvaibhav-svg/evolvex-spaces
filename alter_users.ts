import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  try {
    const { execute } = await import('./lib/db');
    console.log('Adding new columns to users table...');
    await execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_number TEXT DEFAULT ''");
    await execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS achievements_text TEXT DEFAULT ''");
    await execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS miscellaneous TEXT DEFAULT ''");
    console.log('Done!');
  } catch (err) {
    console.error(err);
  }
}

main();

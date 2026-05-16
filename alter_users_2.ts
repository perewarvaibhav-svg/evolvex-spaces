import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  try {
    const { execute } = await import('./lib/db');
    console.log('Adding college fields to users table...');
    await execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT ''");
    await execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT ''");
    await execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT DEFAULT ''");
    console.log('Done!');
  } catch (err) {
    console.error(err);
  }
}

main();

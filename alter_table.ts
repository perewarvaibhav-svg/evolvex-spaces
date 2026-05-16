import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function alterTable() {
  try {
    const { execute } = await import('./lib/db');
    console.log('Altering access_requests table...');
    
    await execute("ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS requested_role TEXT DEFAULT 'student'");
    
    console.log('Table altered successfully!');
  } catch (error) {
    console.error('Error altering table:', error);
  }
}

alterTable();

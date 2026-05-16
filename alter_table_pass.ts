import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function alterTableAgain() {
  try {
    const { execute } = await import('./lib/db');
    console.log('Altering access_requests table to add password_hash...');
    
    await execute("ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS password_hash TEXT");
    
    console.log('Table altered successfully!');
  } catch (error) {
    console.error('Error altering table:', error);
  }
}

alterTableAgain();

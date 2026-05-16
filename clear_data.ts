import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function clearData() {
  try {
    const { execute } = await import('./lib/db');
    console.log('Clearing demo data...');
    
    await execute("DELETE FROM users WHERE role = 'student'");
    await execute("DELETE FROM tasks WHERE id > 0");
    await execute("DELETE FROM submissions WHERE id > 0");
    await execute("DELETE FROM activities WHERE id > 0");
    await execute("DELETE FROM journey WHERE id > 0");
    await execute("DELETE FROM badges WHERE id > 0");
    await execute("DELETE FROM wins WHERE id > 0");
    await execute("DELETE FROM attendance_events WHERE id > 0");
    await execute("DELETE FROM attendance WHERE id > 0");
    await execute("DELETE FROM access_requests WHERE id > 0");

    console.log('All demo data cleared successfully!');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

clearData();

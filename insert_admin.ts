import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { execute, hashPassword } from './lib/db';

async function run() {
  try {
    console.log('Inserting Vaibhav as admin...');
    await execute(
      'INSERT INTO users(name,email,password_hash,role,project_name,one_liner,problem,project_link,linkedin,category,stage,is_public,must_change_password,quote) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      ['Vaibhav', 'perewarvaibhav@gmail.com', hashPassword('vibu@2007'), 'admin', 'EvolveX', '', '', '', '', 'Other', '', 0, 0, '']
    );
    console.log('Successfully inserted admin user.');
  } catch (err: any) {
    if (err.message.includes('duplicate key value')) {
      console.log('User already exists. Updating password...');
      await execute('UPDATE users SET password_hash=?, role=? WHERE email=?', [hashPassword('vibu@2007'), 'admin', 'perewarvaibhav@gmail.com']);
      console.log('Successfully updated existing user.');
    } else {
      console.error('Error inserting user:', err);
    }
  }
}

run();

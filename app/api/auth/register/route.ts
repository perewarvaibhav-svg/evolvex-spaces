import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { query, execute, hashPassword, initDb } from '@/lib/db';
import { recordDailyLogin } from '@/lib/helpers';

let dbInit = false;
async function ensureDb() {
  if (!dbInit) { await initDb(); dbInit = true; }
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  
  const body = await req.formData();
  const name = ((body.get('name') as string) || '').trim();
  const email = ((body.get('email') as string) || '').trim().toLowerCase();
  const password = (body.get('password') as string) || '';

  if (!name || !email || !password) {
    return NextResponse.redirect(new URL('/register?error=Missing+fields', req.url));
  }

  // Check if user already exists
  const existingUser = await query('SELECT id FROM users WHERE email=?', [email], true);
  if (existingUser) {
    return NextResponse.redirect(new URL('/register?error=Email+already+exists', req.url));
  }

  // Insert new user
  try {
    const hashedPwd = hashPassword(password);
    const result = await execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPwd, 'student']
    );

    // Get the newly created user
    const user: any = await query('SELECT * FROM users WHERE email=?', [email], true);
    
    // Automatically log them in
    session.user_id = user.id;
    session.role = user.role;
    session.name = user.name;
    session.flash = [{ cat: 'success', msg: 'Registration successful! Welcome to EvolveX.' }];
    await recordDailyLogin(user.id);
    await session.save();

    const resRedirect = NextResponse.redirect(new URL('/dashboard', req.url));
    resRedirect.headers.set('Set-Cookie', res.headers.get('Set-Cookie') || '');
    
    await getIronSession<SessionData>(req, resRedirect, sessionOptions).then(async (s) => {
      s.user_id = user.id; s.role = user.role; s.name = user.name;
      s.flash = [{ cat: 'success', msg: 'Registration successful! Welcome to EvolveX.' }];
      await s.save();
    });

    return resRedirect;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.redirect(new URL('/register?error=Registration+failed', req.url));
  }
}

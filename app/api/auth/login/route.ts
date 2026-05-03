import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { query } from '@/lib/db';
import { checkPassword } from '@/lib/db';
import { recordDailyLogin } from '@/lib/helpers';
import { initDb } from '@/lib/db';

let dbInit = false;
async function ensureDb() {
  if (!dbInit) { await initDb(); dbInit = true; }
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  const body = await req.formData();
  const email = ((body.get('email') as string) || '').trim().toLowerCase();
  const password = (body.get('password') as string) || '';

  const user: any = await query('SELECT * FROM users WHERE email=?', [email], true);
  if (user && checkPassword(password, user.password_hash)) {
    session.user_id = user.id;
    session.role = user.role;
    session.name = user.name;
    session.flash = [{ cat: 'success', msg: 'Logged in successfully.' }];
    await recordDailyLogin(user.id);
    await session.save();
    const response = NextResponse.redirect(new URL('/dashboard', req.url));
    response.headers.set('Set-Cookie', res.headers.get('Set-Cookie') || '');
    // Re-save session on the redirect response
    const resRedirect = NextResponse.redirect(new URL('/dashboard', req.url));
    await getIronSession<SessionData>(req, resRedirect, sessionOptions).then(async (s) => {
      s.user_id = user.id; s.role = user.role; s.name = user.name;
      s.flash = [{ cat: 'success', msg: 'Logged in successfully.' }];
      await s.save();
    });
    return resRedirect;
  } else {
    const resRedirect = NextResponse.redirect(new URL('/login?error=1', req.url));
    return resRedirect;
  }
}

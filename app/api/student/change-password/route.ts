import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute, query, checkPassword, hashPassword } from '@/lib/db';
import { sendEmail, getUser } from '@/lib/helpers';

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  if (!session.user_id) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  const userId = session.user_id;
  const user = await getUser(userId);
  const body = await req.formData();
  const current_password = (body.get('current_password') as string) || '';
  const new_password = (body.get('new_password') as string) || '';
  const confirm_password = (body.get('confirm_password') as string) || '';

  if (!checkPassword(current_password, user.password_hash)) {
    session.flash = [{ cat: 'danger', msg: 'Invalid password.' }];
  } else if (new_password.length < 6) {
    session.flash = [{ cat: 'warning', msg: 'Invalid password.' }];
  } else if (new_password !== confirm_password) {
    session.flash = [{ cat: 'warning', msg: 'Invalid password.' }];
  } else {
    await execute('UPDATE users SET password_hash=?, must_change_password=0 WHERE id=?', [hashPassword(new_password), userId]);
    sendEmail(user.email, 'Your EvolveX password was changed', `Hi ${user.name},\n\nYour EvolveX account password was changed successfully. If this was not you, contact admin.\n\n- EvolveX Team`);
    session.flash = [{ cat: 'success', msg: 'Password updated.' }];
  }
  const redirect = NextResponse.redirect(new URL('/dashboard', req.url));
  await getIronSession<SessionData>(req, redirect, sessionOptions).then(async (s) => {
    Object.assign(s, session); await s.save();
  });
  return redirect;
}

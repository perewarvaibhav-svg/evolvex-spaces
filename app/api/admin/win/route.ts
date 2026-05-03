import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute, query } from '@/lib/db';
import { nowIso, todayIso, grantBadge } from '@/lib/helpers';

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  
  const getRedirect = async () => {
    const redirect = NextResponse.redirect(new URL('/admin', req.url));
    await getIronSession<SessionData>(req, redirect, sessionOptions).then(async (s) => {
      Object.assign(s, session); await s.save();
    });
    return redirect;
  };

  if (!session.user_id || session.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  const body = await req.formData();
  if (body.get('featured')) await execute('UPDATE wins SET featured=0');
  
  const userId = body.get('user_id') as string || null;
  const student: any = userId ? await query('SELECT name FROM users WHERE id=?', [userId], true) : null;
  const title = student ? `${student.name} — Student of the Week` : 'EvolveX Win';
  
  await execute('INSERT INTO wins(user_id,title,description,featured,created_at) VALUES(?,?,?,?,?)',
    [userId, title, (body.get('description') as string) || '', body.get('featured') ? 1 : 0, nowIso()]);
    
  if (userId) {
    await execute("UPDATE users SET featured=0 WHERE role='student'");
    await execute('UPDATE users SET featured=1 WHERE id=?', [userId]);
    await grantBadge(parseInt(userId), 'Student of the Week', (body.get('description') as string) || 'Selected as Student of the Week by the EvolveX team.', todayIso());
  }
  
  session.flash = [{ cat: 'success', msg: 'Status updated.' }];
  return await getRedirect();
}

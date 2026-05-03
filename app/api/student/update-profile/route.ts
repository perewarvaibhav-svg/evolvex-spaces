import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute } from '@/lib/db';
import { nowIso } from '@/lib/helpers';

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  if (!session.user_id || session.role !== 'student') {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  const userId = session.user_id;
  const body = await req.formData();
  const fields = ['name', 'photo', 'project_name', 'one_liner', 'problem', 'project_link', 'linkedin', 'category', 'stage'];
  const values = fields.map(f => ((body.get(f) as string) || '').trim());
  const isPublic = body.get('is_public') ? 1 : 0;
  const setClause = fields.map(f => `${f}=?`).join(', ');
  await execute(`UPDATE users SET ${setClause}, is_public=?, must_change_password=0, last_active=? WHERE id=?`, [...values, isPublic, nowIso(), userId]);
  await execute('INSERT INTO journey(user_id,event_type,title,details,created_at) VALUES(?,?,?,?,?)', [userId, 'profile', 'Profile updated', 'Project/profile details changed', nowIso()]);
  session.flash = [{ cat: 'success', msg: 'Profile updated.' }];
  const redirect = NextResponse.redirect(new URL('/student-dashboard', req.url));
  await getIronSession<SessionData>(req, redirect, sessionOptions).then(async (s) => {
    Object.assign(s, session); await s.save();
  });
  return redirect;
}

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
  
  // Split fields into two queries to avoid exceeding the 15-parameter limit of supabase_execute
  const fields1 = ['name', 'photo', 'project_name', 'one_liner', 'problem', 'project_link', 'linkedin', 'category', 'stage'];
  const values1 = fields1.map(f => ((body.get(f) as string) || '').trim());
  const setClause1 = fields1.map(f => `${f}=?`).join(', ');
  await execute(`UPDATE users SET ${setClause1} WHERE id=?`, [...values1, userId]);

  const fields2 = ['mobile_number', 'achievements_text', 'miscellaneous', 'college_name', 'branch', 'department'];
  const values2 = fields2.map(f => ((body.get(f) as string) || '').trim());
  const setClause2 = fields2.map(f => `${f}=?`).join(', ');
  const isPublic = body.get('is_public') ? 1 : 0;
  await execute(`UPDATE users SET ${setClause2}, is_public=?, must_change_password=0, last_active=? WHERE id=?`, [...values2, isPublic, nowIso(), userId]);

  await execute('INSERT INTO journey(user_id,event_type,title,details,created_at) VALUES(?,?,?,?,?)', [userId, 'profile', 'Profile updated', 'Project/profile details changed', nowIso()]);
  session.flash = [{ cat: 'success', msg: 'Profile updated.' }];
  const redirect = NextResponse.redirect(new URL('/student-dashboard', req.url));
  await getIronSession<SessionData>(req, redirect, sessionOptions).then(async (s) => {
    Object.assign(s, session); await s.save();
  });
  return redirect;
}

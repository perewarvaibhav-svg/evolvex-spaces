import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute } from '@/lib/db';
import { nowIso, todayIso, grantBadge } from '@/lib/helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
  
  const userId = parseInt(id, 10);
  const body = await req.formData();
  const featured = body.get('featured') ? 1 : 0;
  
  if (featured) {
    await execute("UPDATE users SET featured=0 WHERE role='student'");
    await grantBadge(userId, 'Student of the Week', (body.get('sow_description') as string) || 'Selected as Student of the Week by the EvolveX team.', (body.get('sow_date') as string) || todayIso());
  }
  
  await execute('UPDATE users SET stage=?, featured=?, is_public=? WHERE id=?',
    [body.get('stage') as string, featured, body.get('is_public') ? 1 : 0, userId]);
  await execute('INSERT INTO journey(user_id,event_type,title,details,created_at) VALUES(?,?,?,?,?)',
    [userId, 'stage', `Stage updated to ${body.get('stage')}`, 'Updated by admin', nowIso()]);
    
  session.flash = [{ cat: 'success', msg: 'Status updated.' }];
  return await getRedirect();
}

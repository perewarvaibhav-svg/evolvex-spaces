import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute, query } from '@/lib/db';
import { nowIso, recalcUser } from '@/lib/helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  
  const getRedirect = async () => {
    const redirect = NextResponse.redirect(new URL('/student-dashboard', req.url));
    await getIronSession<SessionData>(req, redirect, sessionOptions).then(async (s) => {
      Object.assign(s, session); await s.save();
    });
    return redirect;
  };
  
  if (!session.user_id || session.role !== 'student') {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  const userId = session.user_id;
  const eventId = parseInt(id, 10);
  const event: any = await query('SELECT * FROM attendance_events WHERE id=?', [eventId], true);
  if (!event) {
    session.flash = [{ cat: 'danger', msg: 'Invalid status.' }];
    return await getRedirect();
  }
  
  const body = await req.formData();
  const status = (body.get('status') as string) || 'Attended';
  const mode = (body.get('mode') as string) || event.mode;
  const reason = ((body.get('reason') as string) || '').trim();
  const takeaway = ((body.get('takeaway') as string) || '').trim();
  const points = status === 'Attended' ? parseInt(event.points || 0) : 0;
  
  const existing: any = await query('SELECT id FROM attendance WHERE event_id=? AND user_id=?', [eventId, userId], true);
  if (existing) {
    await execute('UPDATE attendance SET status=?, mode=?, reason=?, takeaway=?, marked_at=?, points_awarded=? WHERE id=?',
      [status, mode, reason, takeaway, nowIso(), points, existing.id]);
  } else {
    await execute('INSERT INTO attendance(event_id,user_id,status,mode,reason,takeaway,marked_at,points_awarded) VALUES(?,?,?,?,?,?,?,?)',
      [eventId, userId, status, mode, reason, takeaway, nowIso(), points]);
  }
  
  await execute('INSERT INTO journey(user_id,event_type,title,details,created_at) VALUES(?,?,?,?,?)',
    [userId, 'attendance', `${event.title} → ${status}`, status === 'Attended' ? takeaway : `Not attended: ${reason}`, nowIso()]);
  await recalcUser(userId);
  
  session.flash = [{ cat: 'success', msg: 'Status updated.' }];
  return await getRedirect();
}

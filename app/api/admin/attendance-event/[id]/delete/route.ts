import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  
  if (!session.user_id || session.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const getRedirect = async () => {
    const redirect = NextResponse.redirect(new URL('/admin', req.url));
    await getIronSession<SessionData>(req, redirect, sessionOptions).then(async (s) => {
      Object.assign(s, session); await s.save();
    });
    return redirect;
  };

  try {
    // Also delete associated attendance records so points can recalculate later if needed
    await execute('DELETE FROM attendance WHERE event_id=?', [id]);
    await execute('DELETE FROM attendance_events WHERE id=?', [id]);
    session.flash = [{ cat: 'success', msg: 'Attendance event deleted.' }];
  } catch (e) {
    session.flash = [{ cat: 'error', msg: 'Error deleting event.' }];
  }

  return await getRedirect();
}

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
    await execute('DELETE FROM sessions_data WHERE id=?', [id]);
    session.flash = [{ cat: 'success', msg: 'Session deleted.' }];
  } catch (e) {
    session.flash = [{ cat: 'error', msg: 'Error deleting session.' }];
  }

  return await getRedirect();
}

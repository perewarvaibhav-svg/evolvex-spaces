import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute, query } from '@/lib/db';

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
  const request_id = Number(body.get('request_id'));
  
  if (!request_id) {
    session.flash = [{ cat: 'error', msg: 'Invalid request ID.' }];
    return await getRedirect();
  }

  try {
    await execute("UPDATE access_requests SET status='rejected' WHERE id=?", [request_id]);
    session.flash = [{ cat: 'success', msg: 'Request rejected.' }];
  } catch (err: any) {
    session.flash = [{ cat: 'error', msg: 'Database error rejecting request.' }];
  }

  return await getRedirect();
}

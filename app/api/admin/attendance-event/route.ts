import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute } from '@/lib/db';
import { nowIso } from '@/lib/helpers';

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
  await execute('INSERT INTO attendance_events(title,event_date,event_type,mode,points,description,created_at) VALUES(?,?,?,?,?,?,?)',
    [
      body.get('title') as string, 
      body.get('event_date') as string, 
      body.get('event_type') as string, 
      (body.get('mode') as string) || 'Offline', 
      parseInt((body.get('points') as string) || '15'), 
      (body.get('description') as string) || '', 
      nowIso()
    ]);
    
  session.flash = [{ cat: 'success', msg: 'Status updated.' }];
  return await getRedirect();
}

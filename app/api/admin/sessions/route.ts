import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute } from '@/lib/db';
import { nowIso } from '@/lib/helpers';

export async function POST(req: NextRequest) {
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

  const body = await req.formData();
  const session_id = body.get('session_id') as string;
  const title = body.get('title') as string;
  const speaker = body.get('speaker') as string || '';
  const linkedin = body.get('linkedin') as string || '';
  const event_date = body.get('event_date') as string;
  const event_type = body.get('event_type') as string;
  const photo_url = body.get('photo_url') as string || '';
  const description = body.get('description') as string || '';

  try {
    if (session_id) {
      await execute(
        'UPDATE sessions_data SET title=?, speaker=?, linkedin=?, event_date=?, event_type=?, photo_url=?, description=? WHERE id=?',
        [title, speaker, linkedin, event_date, event_type, photo_url, description, session_id]
      );
      session.flash = [{ cat: 'success', msg: 'Session updated.' }];
    } else {
      await execute(
        'INSERT INTO sessions_data (title, speaker, linkedin, event_date, event_type, photo_url, description, created_at) VALUES (?,?,?,?,?,?,?,?)',
        [title, speaker, linkedin, event_date, event_type, photo_url, description, nowIso()]
      );
      session.flash = [{ cat: 'success', msg: 'Session created.' }];
    }
  } catch (e) {
    session.flash = [{ cat: 'error', msg: 'Database error updating session.' }];
  }

  return await getRedirect();
}

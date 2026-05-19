import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute } from '@/lib/db';
import { nowIso, blastEmail } from '@/lib/helpers';

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
  const title = body.get('title') as string;
  const message = body.get('body') as string;
  const priority = body.get('priority') as string || 'normal';

  // Expires in 7 days by default
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ');

  try {
    await execute('INSERT INTO announcements(title,body,priority,author_id,created_at,expires_at) VALUES(?,?,?,?,?,?)',
      [title, message, priority, session.user_id, nowIso(), expires_at]);
      
    // Send email blast
    await blastEmail(
      `New EvolveX Announcement: ${title}`,
      `A new announcement has been posted to your dashboard:\n\n"${title}"\n\n${message}\n\nPlease check your EvolveX dashboard for details.`
    );
    
    session.flash = [{ cat: 'success', msg: 'Announcement posted to all students.' }];
  } catch (e) {
    session.flash = [{ cat: 'error', msg: 'Error posting announcement.' }];
  }

  return await getRedirect();
}

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute } from '@/lib/db';
import { recalcUser, nowIso } from '@/lib/helpers';

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
  const submission_id = body.get('submission_id') as string;
  const user_id = parseInt(body.get('user_id') as string);
  const action = body.get('action') as string;

  try {
    if (action === 'approve') {
      await execute('UPDATE submissions SET reviewed=1 WHERE id=?', [submission_id]);
      session.flash = [{ cat: 'success', msg: 'Submission approved and points locked.' }];
    } else if (action === 'reject') {
      // Revert status to In Progress, remove points_awarded
      await execute('UPDATE submissions SET status=?, points_awarded=0, reviewed=0 WHERE id=?', ['In Progress', submission_id]);
      
      // Notify user in journey
      await execute('INSERT INTO journey(user_id,event_type,title,details,created_at) VALUES(?,?,?,?,?)',
        [user_id, 'task', 'Task Submission Rejected', 'Admin requested revisions for your task.', nowIso()]);
      
      session.flash = [{ cat: 'success', msg: 'Submission rejected. Sent back to student.' }];
    }
    await recalcUser(user_id);
  } catch (e) {
    session.flash = [{ cat: 'error', msg: 'Error updating submission.' }];
  }

  return await getRedirect();
}

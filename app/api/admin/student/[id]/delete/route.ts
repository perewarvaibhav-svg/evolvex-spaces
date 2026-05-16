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
    const userId = id;
    // Delete all user related records
    await execute('DELETE FROM submissions WHERE user_id=?', [userId]);
    await execute('DELETE FROM activities WHERE user_id=?', [userId]);
    await execute('DELETE FROM journey WHERE user_id=?', [userId]);
    await execute('DELETE FROM badges WHERE user_id=?', [userId]);
    await execute('DELETE FROM wins WHERE user_id=?', [userId]);
    await execute('DELETE FROM attendance WHERE user_id=?', [userId]);
    await execute('DELETE FROM password_reset_tokens WHERE user_id=?', [userId]);
    await execute('DELETE FROM users WHERE id=?', [userId]);
    
    session.flash = [{ cat: 'success', msg: 'Student account fully deleted.' }];
  } catch (e) {
    session.flash = [{ cat: 'error', msg: 'Error deleting student.' }];
  }

  return await getRedirect();
}

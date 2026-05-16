import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute, query, hashPassword } from '@/lib/db';

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  
  const getRedirect = async (url: string) => {
    const redirect = NextResponse.redirect(new URL(url, req.url));
    await getIronSession<SessionData>(req, redirect, sessionOptions).then(async (s) => {
      Object.assign(s, session); await s.save();
    });
    return redirect;
  };

  const body = await req.formData();
  const name = (body.get('name') as string)?.trim() || '';
  const email = (body.get('email') as string)?.trim().toLowerCase() || '';
  const requestedRole = (body.get('requested_role') as string)?.trim() || 'student';
  const password = (body.get('password') as string)?.trim() || '';
  
  if (!name || !email || !email.includes('@') || !password) {
    session.flash = [{ cat: 'error', msg: 'Valid name, email and password are required.' }];
    return await getRedirect('/request-access');
  }

  // Check if user already exists
  const existingUser = await query('SELECT id FROM users WHERE email=?', [email], true);
  if (existingUser) {
    session.flash = [{ cat: 'error', msg: 'An account with this email already exists.' }];
    return await getRedirect('/login');
  }

  // Check if request already exists
  const existingReq = await query('SELECT id, status FROM access_requests WHERE email=?', [email], true);
  if (existingReq) {
    if (existingReq.status === 'pending') {
      session.flash = [{ cat: 'error', msg: 'An access request is already pending for this email.' }];
    } else if (existingReq.status === 'rejected') {
      session.flash = [{ cat: 'error', msg: 'Access request for this email was rejected.' }];
    } else {
      session.flash = [{ cat: 'error', msg: 'An account with this email was already approved.' }];
    }
    return await getRedirect('/request-access');
  }

  const nowIso = () => new Date().toISOString().slice(0, 16).replace('T', ' ');

  try {
    const hashed = hashPassword(password);
    await execute('INSERT INTO access_requests(name, email, status, created_at, requested_role, password_hash) VALUES(?,?,?,?,?,?)', [
      name, email, 'pending', nowIso(), requestedRole, hashed
    ]);
    session.flash = [{ cat: 'success', msg: 'Access request submitted! An admin will review it.' }];
    return await getRedirect('/login');
  } catch (err: any) {
    session.flash = [{ cat: 'error', msg: 'Error submitting request.' }];
    return await getRedirect('/request-access');
  }
}

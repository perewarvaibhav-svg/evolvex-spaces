import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute, query, hashPassword } from '@/lib/db';
import { makePassword, sendEmail } from '@/lib/helpers';

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

  const request = await query('SELECT * FROM access_requests WHERE id=?', [request_id], true);
  if (!request || request.status !== 'pending') {
    session.flash = [{ cat: 'error', msg: 'Request not found or already processed.' }];
    return await getRedirect();
  }

  const existingUser = await query('SELECT id FROM users WHERE email=?', [request.email], true);
  if (existingUser) {
    session.flash = [{ cat: 'error', msg: 'A user with this email already exists.' }];
    await execute("UPDATE access_requests SET status='rejected' WHERE id=?", [request_id]);
    return await getRedirect();
  }

  const tempPwd = makePassword();
  
  try {
    await execute(
      'INSERT INTO users(name,email,password_hash,role,project_name,one_liner,problem,project_link,linkedin,category,stage,is_public,must_change_password,quote) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [request.name, request.email, hashPassword(tempPwd), 'student', '', '', '', '', '', 'Other', '', 0, 1, '']
    );
    
    await execute("UPDATE access_requests SET status='approved' WHERE id=?", [request_id]);
    
    sendEmail(request.email, 'Your EvolveX Access Approved',
      `Hi ${request.name},\n\nYour request to access the EvolveX portal has been approved.\n\nLogin email: ${request.email}\nTemporary password: ${tempPwd}\n\nPlease login, change your password from My Profile, and complete your profile.\n\n- EvolveX Team`
    );

    session.flash = [{ cat: 'success', msg: `Request approved for ${request.email}.` }];
  } catch (err: any) {
    session.flash = [{ cat: 'error', msg: 'Database error approving request.' }];
  }

  return await getRedirect();
}

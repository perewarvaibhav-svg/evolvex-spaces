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
  const raw: string = (body.get('emails') as string) || '';
  const emails = raw.replace(/\n/g, ',').split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);
  
  for (const email of emails) {
    if (!email.includes('@') || await query('SELECT id FROM users WHERE email=?', [email], true)) continue;
    const temp = makePassword();
    const name = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    await execute('INSERT INTO users(name,email,password_hash,role,project_name,one_liner,problem,project_link,linkedin,category,stage,is_public,must_change_password,quote) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [name, email, hashPassword(temp), 'student', '', '', '', '', '', 'Other', '', 0, 1, '']);
    sendEmail(email, 'Your EvolveX login setup',
      `Hi ${name},\n\nYour EvolveX student profile has been created.\n\nLogin email: ${email}\nTemporary password: ${temp}\n\nPlease login, change your password from My Profile, and complete your profile.\n\n- EvolveX Team`);
  }
  
  session.flash = [{ cat: 'success', msg: 'Status updated.' }];
  return await getRedirect();
}

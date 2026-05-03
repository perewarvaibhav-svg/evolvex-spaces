import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute, query } from '@/lib/db';
import { nowIso, recalcUser } from '@/lib/helpers';

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  if (!session.user_id || session.role !== 'student') {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  const userId = session.user_id;
  const body = await req.formData();
  const typ = body.get('type') as string;
  
  const getRedirect = async () => {
      const redirect = NextResponse.redirect(new URL('/student-dashboard', req.url));
      await getIronSession<SessionData>(req, redirect, sessionOptions).then(async (s) => {
        Object.assign(s, session); await s.save();
      });
      return redirect;
  };
  
  if (!['revenue', 'conversation'].includes(typ)) {
    session.flash = [{ cat: 'warning', msg: 'Invalid status.' }];
    return await getRedirect();
  }
  const already = await query('SELECT id FROM activities WHERE user_id=? AND type=? AND date(created_at)=date(?)', [userId, typ, new Date().toISOString()], true);
  if (already) {
    session.flash = [{ cat: 'warning', msg: 'Already submitted today.' }];
    return await getRedirect();
  }
  const title = ((body.get('title') as string) || typ.charAt(0).toUpperCase() + typ.slice(1)).trim();
  const desc = ((body.get('description') as string) || '').trim();
  const amount = parseFloat((body.get('amount') as string) || '0');
  const customerCount = typ === 'conversation' ? parseInt((body.get('customer_count') as string) || '0') : 0;
  
  await execute('INSERT INTO activities(user_id,type,title,description,amount,customer_count,created_at) VALUES(?,?,?,?,?,?,?)',
    [userId, typ, title, desc, amount, customerCount, nowIso()]);
  const details = (typ === 'conversation' ? `Spoke to ${customerCount} customer(s). ` : '') + desc;
  await execute('INSERT INTO journey(user_id,event_type,title,details,created_at) VALUES(?,?,?,?,?)',
    [userId, typ, title, details, nowIso()]);
  await recalcUser(userId);
  
  session.flash = [{ cat: 'success', msg: 'Status updated.' }];
  return await getRedirect();
}

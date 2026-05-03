import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute } from '@/lib/db';

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
  const taskId = body.get('task_id') as string;
  const payload = [
    body.get('week') as string, 
    body.get('title') as string, 
    (body.get('description') as string) || '', 
    body.get('points') as string, 
    body.get('due_date') as string
  ];
  
  if (taskId) {
    await execute('UPDATE tasks SET week=?, title=?, description=?, points=?, due_date=? WHERE id=?', [...payload, taskId]);
  } else {
    await execute('INSERT INTO tasks(week,title,description,points,due_date) VALUES(?,?,?,?,?)', payload);
  }
  
  session.flash = [{ cat: 'success', msg: 'Status updated.' }];
  return await getRedirect();
}

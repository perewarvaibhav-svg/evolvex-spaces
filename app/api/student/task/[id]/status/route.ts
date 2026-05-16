import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { execute, query } from '@/lib/db';
import { nowIso, todayIso, recalcUser } from '@/lib/helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  if (!session.user_id || session.role !== 'student') {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  const userId = session.user_id;
  const taskId = parseInt(id, 10);
  const body = await req.formData();
  const status = (body.get('status') as string) || 'Not Started';
  const note = ((body.get('work_note') as string) || '').trim();
  
  const github = ((body.get('github_url') as string) || '').trim();
  const prototype = ((body.get('prototype_url') as string) || '').trim();
  const file = body.get('file_upload') as File | null;
  
  let link = '';
  if (github) link += github + ' ';
  if (prototype) link += prototype + ' ';
  if (file && file.size > 0) {
    link += `[Attached: ${file.name}]`;
  }
  link = link.trim();
  
  const task: any = await query('SELECT * FROM tasks WHERE id=?', [taskId], true);
  const existing: any = await query('SELECT * FROM submissions WHERE user_id=? AND task_id=?', [userId, taskId], true);
  const points = (status === 'Done' && todayIso() <= task.due_date) ? parseInt(task.points) : 0;
  const submittedAt = status === 'Done' ? nowIso() : '';
  
  if (existing) {
    await execute('UPDATE submissions SET status=?, work_note=?, proof_link=?, submitted_at=?, points_awarded=? WHERE id=?',
      [status, note, link, submittedAt || existing.submitted_at, points, existing.id]);
  } else {
    await execute('INSERT INTO submissions(user_id,task_id,status,work_note,proof_link,submitted_at,points_awarded) VALUES(?,?,?,?,?,?,?)',
      [userId, taskId, status, note, link, submittedAt, points]);
  }
  await execute('INSERT INTO journey(user_id,event_type,title,details,created_at) VALUES(?,?,?,?,?)',
    [userId, 'task', `${task.title} → ${status}`, note || 'Task status updated', nowIso()]);
  await recalcUser(userId);
  
  session.flash = [{ cat: 'success', msg: 'Status updated.' }];
  const redirect = NextResponse.redirect(new URL('/student-dashboard', req.url));
  await getIronSession<SessionData>(req, redirect, sessionOptions).then(async (s) => {
    Object.assign(s, session); await s.save();
  });
  return redirect;
}

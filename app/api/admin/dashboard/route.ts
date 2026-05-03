import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { query } from '@/lib/db';
import { currentWeek, todayIso, EVENT_TYPES, STAGES } from '@/lib/helpers';

export async function GET(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  if (!session.user_id || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const students = await query("SELECT * FROM users WHERE role='student' ORDER BY points DESC");
  const tasks = await query('SELECT * FROM tasks ORDER BY week, due_date, id');
  const wins = await query('SELECT wins.*, users.name FROM wins LEFT JOIN users ON users.id=wins.user_id ORDER BY wins.id DESC');
  const attendanceEvents = await query('SELECT * FROM attendance_events ORDER BY event_date DESC, id DESC');
  
  const flash = session.flash || [];
  session.flash = [];
  await session.save();

  return NextResponse.json({
    students,
    tasks,
    wins,
    attendance_events: attendanceEvents,
    current_week: currentWeek(),
    event_types: EVENT_TYPES,
    stages: STAGES,
    today: todayIso(),
    flash
  });
}

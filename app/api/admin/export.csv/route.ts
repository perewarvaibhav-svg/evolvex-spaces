import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { query } from '@/lib/db';
import { stringify } from 'csv-stringify/sync';

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  
  if (!session.user_id || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const rows: any[] = await query("SELECT name,project_name,points,tasks_done,customer_convos,sessions_attended,revenue,streak,last_active FROM users WHERE role='student' ORDER BY points DESC");
  const csv = stringify([
    ['Name', 'Project', 'Points', 'Tasks Done', 'Customer Conversation Days', 'Sessions Attended', 'Revenue', 'Login Streak', 'Last Active'],
    ...rows.map(r => [r.name, r.project_name, r.points, r.tasks_done, r.customer_convos, r.sessions_attended, r.revenue, r.streak, r.last_active])
  ]);
  
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=evolvex_leaderboard.csv',
    },
  });
}

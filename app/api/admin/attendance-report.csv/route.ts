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
  
  const rows: any[] = await query(`SELECT e.event_date, e.title, e.event_type, e.mode event_mode, u.name, u.email, COALESCE(a.status,'Not Marked') status, a.mode, a.reason, a.takeaway, COALESCE(a.points_awarded,0) points FROM attendance_events e CROSS JOIN users u LEFT JOIN attendance a ON a.event_id=e.id AND a.user_id=u.id WHERE u.role='student' ORDER BY e.event_date DESC, e.id DESC, u.name`);
  const csv = stringify([
    ['Event Date', 'Event', 'Type', 'Default Mode', 'Student', 'Email', 'Status', 'Student Mode', 'Reason', 'Takeaway', 'Points'],
    ...rows.map(r => [r.event_date, r.title, r.event_type, r.event_mode, r.name, r.email, r.status, r.mode, r.reason, r.takeaway, r.points])
  ]);
  
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=evolvex_attendance_report.csv',
    },
  });
}

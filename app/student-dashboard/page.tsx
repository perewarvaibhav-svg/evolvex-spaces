import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { currentWeek, leaderboard, getUser } from '@/lib/helpers';
import StudentDashboardClient from './ClientPage';

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session.user_id || session.role !== 'student') {
    redirect('/login');
  }
  
  const userId = session.user_id;
  const user = await getUser(userId);
  const tasks = await query(
    `SELECT t.*, COALESCE(s.status,'Not Started') status, s.work_note, s.proof_link, s.submitted_at, s.points_awarded FROM tasks t LEFT JOIN submissions s ON s.task_id=t.id AND s.user_id=? ORDER BY t.due_date, t.id`,
    [userId]
  );
  const journey = await query('SELECT * FROM journey WHERE user_id=? ORDER BY created_at DESC LIMIT 10', [userId]);
  const badges = await query('SELECT * FROM badges WHERE user_id=?', [userId]);
  const rankRows = await leaderboard();
  const rank = rankRows.findIndex((r: any) => r.id === userId) + 1 || null;
  const attendanceEvents = await query(
    `SELECT e.*, a.status, a.mode marked_mode, a.reason, a.takeaway, a.marked_at FROM attendance_events e LEFT JOIN attendance a ON a.event_id=e.id AND a.user_id=? ORDER BY e.event_date DESC, e.id DESC`,
    [userId]
  );
  const attendanceHistory = await query(
    `SELECT e.title, e.event_date, e.event_type, e.mode event_mode, a.status, a.mode, a.reason, a.takeaway, a.points_awarded, a.marked_at FROM attendance a JOIN attendance_events e ON e.id=a.event_id WHERE a.user_id=? ORDER BY e.event_date DESC, a.id DESC`,
    [userId]
  );
  const todayRevenue = await query('SELECT id FROM activities WHERE user_id=? AND type=? AND CAST(created_at AS DATE) = CAST(? AS DATE)', [userId, 'revenue', new Date().toISOString()], true);
  const todayConversation = await query('SELECT id FROM activities WHERE user_id=? AND type=? AND CAST(created_at AS DATE) = CAST(? AS DATE)', [userId, 'conversation', new Date().toISOString()], true);
  const announcements = await query('SELECT * FROM announcements WHERE expires_at >= ?::timestamp ORDER BY created_at DESC', [new Date().toISOString()]);

  return (
    <StudentDashboardClient 
      user={user}
      tasks={tasks}
      journey={journey}
      badges={badges}
      rank={rank}
      attendance_events={attendanceEvents}
      attendance_history={attendanceHistory}
      today_revenue={todayRevenue}
      today_conversation={todayConversation}
      announcements={announcements}
      current_week={currentWeek()}
    />
  );
}

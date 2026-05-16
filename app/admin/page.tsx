import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { currentWeek, todayIso } from '@/lib/helpers';
import AdminDashboardClient from './ClientPage';

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session.user_id || session.role !== 'admin') {
    redirect('/login');
  }

  const students = await query("SELECT * FROM users WHERE role='student' ORDER BY points DESC");
  const tasks = await query('SELECT * FROM tasks ORDER BY week, due_date, id');
  const wins = await query('SELECT wins.*, users.name FROM wins LEFT JOIN users ON users.id=wins.user_id ORDER BY wins.id DESC');
  const attendanceEvents = await query('SELECT * FROM attendance_events ORDER BY event_date DESC, id DESC');
  const accessRequests = await query("SELECT * FROM access_requests WHERE status='pending' ORDER BY id DESC");
  const sessionsData = await query('SELECT * FROM sessions_data ORDER BY event_date DESC, id DESC');
  const submissions = await query('SELECT s.*, u.name, t.title as task_title, t.points as task_points FROM submissions s JOIN users u ON u.id=s.user_id JOIN tasks t ON t.id=s.task_id WHERE s.status=\'Done\' AND s.reviewed=0 ORDER BY s.submitted_at DESC');

  return (
    <AdminDashboardClient
      students={students}
      tasks={tasks}
      wins={wins}
      attendance_events={attendanceEvents}
      access_requests={accessRequests}
      sessions_data={sessionsData}
      submissions={submissions}
      current_week={currentWeek()}
      today={todayIso()}
    />
  );
}

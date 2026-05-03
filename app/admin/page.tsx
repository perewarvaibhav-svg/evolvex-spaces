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

  return (
    <AdminDashboardClient
      students={students}
      tasks={tasks}
      wins={wins}
      attendance_events={attendanceEvents}
      current_week={currentWeek()}
      today={todayIso()}
    />
  );
}

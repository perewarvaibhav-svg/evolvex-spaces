import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/helpers';
import StudentProfileClient from './ClientPage';

export default async function StudentProfilePage() {
  const session = await getSession();
  if (!session.user_id || session.role !== 'student') {
    redirect('/login');
  }
  const user = await getUser(session.user_id);
  return <StudentProfileClient user={user} />;
}

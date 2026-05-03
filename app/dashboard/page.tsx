import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export default async function DashboardRedirect() {
  const session = await getSession();
  
  if (!session.user_id) {
    redirect('/login');
  }

  if (session.role === 'admin') {
    redirect('/admin');
  } else {
    redirect('/student-dashboard');
  }
}

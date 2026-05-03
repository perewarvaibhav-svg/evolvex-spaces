'use client';
import Link from 'next/link';

export default function Navbar({ session }: { session: { user_id?: number, role?: string } }) {
  return (
    <nav className="nav">
      <Link className="brand" href="/">EvolveX</Link>
      <div className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/sessions" className="nav-link">Our Journey</Link>
        <Link href="/leaderboard">Leaderboard</Link>
        {session.user_id ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <a className="btn ghost" href="/api/auth/logout">Logout</a>
          </>
        ) : (
          <Link className="btn" href="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

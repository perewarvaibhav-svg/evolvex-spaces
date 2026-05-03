'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar({ session }: { session: { user_id?: number, role?: string } }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="nav">
      <Link className="brand" href="/" onClick={() => setIsOpen(false)}>EvolveX</Link>
      
      <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      <div className={`nav-links ${isOpen ? 'active' : ''}`}>
        <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
        <Link href="/sessions" className="nav-link" onClick={() => setIsOpen(false)}>Our Journey</Link>
        <Link href="/leaderboard" onClick={() => setIsOpen(false)}>Leaderboard</Link>
        {session.user_id ? (
          <>
            <Link href="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
            <a className="btn ghost" href="/api/auth/logout">Logout</a>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link className="btn ghost" href="/login" onClick={() => setIsOpen(false)}>Login</Link>
            <Link className="btn" href="/register" onClick={() => setIsOpen(false)}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

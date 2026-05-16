'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="auth">
      <div className="card">
        <h2>Reset Password</h2>
        <p className="muted" style={{ marginBottom: 24 }}>
          {submitted 
            ? "If an account with that email exists, we've sent instructions to reset your password."
            : "Enter your email address and we'll send you a link to reset your password."}
        </p>

        {!submitted ? (
          <form className="form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
            <label>
              Email Address
              <input type="email" required placeholder="name@evolvex.in" />
            </label>
            <button type="submit" className="btn big">Send Reset Link</button>
          </form>
        ) : (
          <Link href="/login" className="btn big" style={{ display: 'block', textAlign: 'center' }}>
            Return to Login
          </Link>
        )}
        
        <p className="muted" style={{ textAlign: 'center', marginTop: 16 }}>
          Remember your password? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}

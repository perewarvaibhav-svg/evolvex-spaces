import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';

export const metadata = { title: 'Forgot Password | EvolveX' };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: { sent?: string; error?: string } }) {
  const session = await getSession();
  if (session.user_id) redirect('/dashboard');

  return (
    <>
      <Navbar session={session as any} />
      <main>
        <section className="auth">
          <p className="eyebrow">Account Recovery</p>
          <h1 style={{ fontSize: 40 }}>Forgot Password</h1>
          <p className="muted" style={{ marginBottom: 32 }}>
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          {searchParams.sent && (
            <div className="flash success" style={{ marginBottom: 24 }}>
              ✅ If that email exists, a reset link has been sent. Check your inbox.
            </div>
          )}
          {searchParams.error && (
            <div className="flash danger" style={{ marginBottom: 24 }}>
              ❌ {searchParams.error}
            </div>
          )}

          <form className="form card" method="post" action="/api/auth/forgot-password">
            <label>
              Email Address
              <input name="email" type="email" required placeholder="you@example.com" autoFocus />
            </label>
            <button className="btn big">Send Reset Link</button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center' }}>
            <a href="/login" style={{ color: 'rgba(255,255,255,0.7)' }}>← Back to Login</a>
          </p>
        </section>
      </main>
    </>
  );
}

export default function Login() {
  return (
    <div className="auth">
      <div className="card">
        <h2>Welcome Back</h2>
        <p className="muted">Enter your email and password to sign in.</p>
        <form className="form" method="post" action="/api/auth/login" style={{ marginTop: 24 }}>
          <label>
            Email ID
            <input type="email" name="email" required placeholder="name@evolvex.in" />
          </label>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
            <label style={{ marginBottom: 0 }}>Password</label>
            <a href="/forgot-password" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>Forgot password?</a>
          </div>
          <input type="password" name="password" required style={{ marginBottom: 16 }} />
          <button className="btn big">Log in to Dashboard</button>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: 16 }}>
          Request Access: <a href="/request-access/intern" style={{ color: 'var(--primary)', fontWeight: 600 }}>Cohort Intern</a> &middot; <a href="/request-access/admin" style={{ color: 'var(--primary)', fontWeight: 600 }}>Admin</a>
        </p>
      </div>
    </div>
  );
}

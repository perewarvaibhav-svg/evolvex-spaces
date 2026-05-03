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
          <label>
            Password
            <input type="password" name="password" required />
          </label>
          <button className="btn big">Log in to Dashboard</button>
        </form>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p className="muted">Don't have an account? <a href="/register" style={{ color: 'var(--ink-primary)', fontWeight: 600 }}>Register Now</a></p>
        </div>
      </div>
    </div>
  );
}

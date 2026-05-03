export default function Register() {
  return (
    <div className="auth">
      <div className="card" style={{ maxWidth: 450 }}>
        <h2>Create an Account</h2>
        <p className="muted">Join the EvolveX cohort and start building.</p>
        <form className="form" method="post" action="/api/auth/register" style={{ marginTop: 24 }}>
          <label>
            Full Name
            <input type="text" name="name" required placeholder="Vaibhav" />
          </label>
          <label>
            Email ID
            <input type="email" name="email" required placeholder="name@evolvex.in" />
          </label>
          <label>
            Password
            <input type="password" name="password" required placeholder="Choose a strong password" />
          </label>
          <button className="btn big">Register</button>
        </form>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p className="muted">Already have an account? <a href="/login" style={{ color: 'var(--ink-primary)', fontWeight: 600 }}>Log In</a></p>
        </div>
      </div>
    </div>
  );
}

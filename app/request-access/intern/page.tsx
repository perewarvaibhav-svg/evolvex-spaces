export default function RequestInternAccess() {
  return (
    <div className="auth">
      <div className="card">
        <h2>Request Intern Access</h2>
        <p className="muted">Enter your details to request cohort intern access to the EvolveX portal.</p>
        <form className="form" method="post" action="/api/request-access" style={{ marginTop: 24 }}>
          <input type="hidden" name="requested_role" value="student" />
          <label>
            Full Name
            <input type="text" name="name" required placeholder="Jane Doe" />
          </label>
          <label>
            Email ID
            <input type="email" name="email" required placeholder="name@evolvex.in" />
          </label>
          <label>
            Password
            <input type="password" name="password" required placeholder="Create a password" />
          </label>
          <button className="btn big">Submit Request</button>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: 16 }}>
          Already have an account? <a href="/login" style={{ color: 'var(--primary)' }}>Log in</a>
        </p>
      </div>
    </div>
  );
}

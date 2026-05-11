export default function RequestAccess() {
  return (
    <div className="auth">
      <div className="card">
        <h2>Request Access</h2>
        <p className="muted">Enter your details to request access to the EvolveX portal. Admins will review your request.</p>
        <form className="form" method="post" action="/api/request-access" style={{ marginTop: 24 }}>
          <label>
            Full Name
            <input type="text" name="name" required placeholder="John Doe" />
          </label>
          <label>
            Email ID
            <input type="email" name="email" required placeholder="name@evolvex.in" />
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

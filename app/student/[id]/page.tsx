import { query } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function StudentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await query('SELECT * FROM users WHERE id=? AND role=?', [parseInt(id, 10), 'student'], true);
  if (!student) {
    notFound();
  }

  const wins = await query('SELECT * FROM wins WHERE user_id=? ORDER BY id DESC', [student.id]);
  const badges = await query('SELECT * FROM badges WHERE user_id=?', [student.id]);

  return (
    <>
      <section className="profile-hero reveal-up">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={student.photo} alt={student.name} />
        <div>
          <h1>{student.name}</h1>
          <p className="muted">{student.email}</p>
        </div>
      </section>

      {student.is_public === 1 && student.project_name ? (
        <section className="two-col profile-content reveal-up">
          <div className="card stagger-in" style={{ padding: 48 }}>
            <span className="tag">{student.category}</span>
            <h2 style={{ fontSize: 32, marginTop: 16 }}>{student.project_name}</h2>
            <p className="eyebrow" style={{ marginTop: 8 }}>{student.one_liner}</p>
            
            <h3 style={{ marginTop: 40, fontSize: 16, color: 'var(--ink-secondary)' }}>Problem being solved</h3>
            <p style={{ marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{student.problem || 'Not defined yet.'}</p>
            
            <div style={{ marginTop: 40, display: 'flex', gap: 16 }}>
              {student.project_link && <Link href={student.project_link} target="_blank" className="btn">Visit Project</Link>}
              {student.linkedin && <Link href={student.linkedin} target="_blank" className="btn ghost">LinkedIn Profile</Link>}
            </div>
          </div>
          <div className="card stagger-in">
            <h3 style={{ borderBottom: '1px solid var(--line)', paddingBottom: 16, marginBottom: 24 }}>Builder Stats</h3>
            <div className="profile-stats">
              <div><b>{student.points}</b><span>Points</span></div>
              <div><b>{student.stage || 'Idea'}</b><span>Stage</span></div>
              <div><b>₹{Math.round(student.revenue || 0)}</b><span>Revenue Earned</span></div>
              <div><b>{student.tasks_done}</b><span>Tasks Done</span></div>
              <div><b>{student.customer_convos}</b><span>Customer Interactions</span></div>
            </div>

            <h3 style={{ borderBottom: '1px solid var(--line)', paddingBottom: 16, marginBottom: 24, marginTop: 40 }}>Badges & Wins</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {badges.length > 0 ? badges.map((b: any) => (
                <span key={b.id} className="badge" title={b.description}>{b.name}</span>
              )) : <p className="muted">No badges earned yet.</p>}
            </div>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {wins.length > 0 ? wins.map((w: any) => (
                <div key={w.id} style={{ borderLeft: '2px solid var(--primary)', paddingLeft: 16 }}>
                  <b>{w.title}</b>
                  <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>{w.description}</p>
                </div>
              )) : null}
            </div>
          </div>
        </section>
      ) : (
        <section className="reveal-up text-center" style={{ marginTop: 80, color: 'var(--ink-secondary)' }}>
          <h2>Project is private or not ready yet.</h2>
        </section>
      )}
    </>
  );
}

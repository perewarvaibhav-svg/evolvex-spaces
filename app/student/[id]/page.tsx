import { query } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/session';

export default async function StudentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await query('SELECT * FROM users WHERE id=? AND role=?', [parseInt(id, 10), 'student'], true);
  if (!student) {
    notFound();
  }

  const session = await getSession();
  const isOwnProfile = session?.user_id === student.id;

  const wins = await query('SELECT * FROM wins WHERE user_id=? ORDER BY id DESC', [student.id]);
  const badges = await query('SELECT * FROM badges WHERE user_id=?', [student.id]);

  return (
    <>
      <section className="profile-hero reveal-up" style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={student.photo} alt={student.name} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 20px', display: 'block' }} />
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>{student.name}</h1>
        </div>
        {isOwnProfile && (
          <div style={{ marginTop: 20 }}>
            <Link href="/student-profile" className="btn ghost">Edit Profile</Link>
          </div>
        )}
      </section>

      <section className="two-col profile-content reveal-up">
          <div className="card stagger-in" style={{ padding: 48 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              <div style={{ padding: 16, background: 'var(--surface-sunken)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-secondary)', marginBottom: 4 }}>Email</div>
                <div style={{ fontWeight: 500, wordBreak: 'break-all' }}>{student.email}</div>
              </div>
              <div style={{ padding: 16, background: 'var(--surface-sunken)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-secondary)', marginBottom: 4 }}>Mobile</div>
                <div style={{ fontWeight: 500 }}>{student.mobile_number || 'N/A'}</div>
              </div>
              <div style={{ padding: 16, background: 'var(--surface-sunken)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-secondary)', marginBottom: 4 }}>College</div>
                <div style={{ fontWeight: 500 }}>{student.college_name || 'N/A'}</div>
              </div>
              <div style={{ padding: 16, background: 'var(--surface-sunken)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-secondary)', marginBottom: 4 }}>Branch</div>
                <div style={{ fontWeight: 500 }}>{student.branch || 'N/A'}</div>
              </div>
              <div style={{ padding: 16, background: 'var(--surface-sunken)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-secondary)', marginBottom: 4 }}>Department</div>
                <div style={{ fontWeight: 500 }}>{student.department || 'N/A'}</div>
              </div>
            </div>

            <span className="tag">{student.category}</span>
            <h2 style={{ fontSize: 24, marginTop: 16 }}>{student.project_name || 'Exploring Ideas'}</h2>
            <p className="eyebrow" style={{ marginTop: 8 }}>{student.one_liner || 'No bio provided.'}</p>
            
            <h3 style={{ marginTop: 40, fontSize: 16, color: 'var(--ink-secondary)' }}>Projects Completed</h3>
            <p style={{ marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{student.problem || 'No projects listed yet.'}</p>
            
            {student.achievements_text && (
              <>
                <h3 style={{ marginTop: 40, fontSize: 16, color: 'var(--ink-secondary)' }}>Achievements</h3>
                <p style={{ marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{student.achievements_text}</p>
              </>
            )}

            {student.miscellaneous && (
              <>
                <h3 style={{ marginTop: 40, fontSize: 16, color: 'var(--ink-secondary)' }}>Miscellaneous</h3>
                <p style={{ marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{student.miscellaneous}</p>
              </>
            )}
            
            <div style={{ marginTop: 40, display: 'flex', gap: 16 }}>
              {student.project_link && <Link href={student.project_link} target="_blank" className="btn">Visit Project</Link>}
              {student.linkedin && <Link href={student.linkedin} target="_blank" className="btn ghost">LinkedIn Profile</Link>}
            </div>
          </div>
          <div className="card stagger-in">
            <h3 style={{ borderBottom: '1px solid var(--line)', paddingBottom: 16, marginBottom: 24 }}>Builder Stats</h3>
            <div className="profile-stats">
              <div><b>{student.points}</b> <span>Points</span></div>
              <div><b>{student.stage || 'Idea'}</b> <span>Stage</span></div>
              <div><b>₹{Math.round(student.revenue || 0)}</b> <span>Revenue Earned</span></div>
              <div><b>{student.tasks_done}</b> <span>Tasks Done</span></div>
              <div><b>{student.customer_convos}</b> <span>Customer Interactions</span></div>
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
    </>
  );
}

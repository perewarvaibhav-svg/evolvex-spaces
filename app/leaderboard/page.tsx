import { leaderboard } from '@/lib/helpers';
import Link from 'next/link';

export default async function Leaderboard() {
  const students = await leaderboard();
  const top3 = students.slice(0, 3);

  return (
    <>
      <section className="leader-hero reveal-up">
        <div>
          <p className="eyebrow">Cohort 1</p>
          <h1>The Builder Board</h1>
          <p className="muted" style={{ fontSize: 20, marginTop: 24, maxWidth: 400 }}>
            Points are earned by completing weekly tasks, attending sessions, and logging customer conversations.
          </p>
        </div>
        <div className="leader-mini">
          <b>{students.length}</b>
          <span>Active Projects</span>
        </div>
      </section>

      {top3.length > 0 && (
        <section className="podium reveal-up stagger-in">
          {top3.map((s, i) => (
            <Link key={s.id} href={`/student/${s.id}`} className={`podium-card rank-${i + 1}`}>
              <div className="rank-bubble">{i + 1}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.photo} alt={s.name} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 24px', display: 'block' }} />
              <h2>{s.name}</h2>
              <p className="muted">{s.project_name}</p>
              <div className="pill" style={{ marginTop: 16 }}>{s.points} pts</div>
            </Link>
          ))}
        </section>
      )}

      <section className="reveal-up stagger-in" style={{ marginTop: 80 }}>
        <h2>All Builders</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Founder</th>
                <th>Project</th>
                <th>Category</th>
                <th>Stage</th>
                <th>Score</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id} className="click-row" data-href={`/student/${s.id}`}>
                  <td><b>#{i + 1}</b></td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.photo} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt={s.name} />
                    <b>{s.name}</b>
                  </td>
                  <td>{s.project_name}</td>
                  <td><span className="tag">{s.category}</span></td>
                  <td><span className="pill">{s.stage}</span></td>
                  <td><b>{s.points}</b></td>
                  <td>
                    <div className="progress">
                      <span style={{ width: `${Math.min(100, (s.points / 500) * 100)}%` }}></span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

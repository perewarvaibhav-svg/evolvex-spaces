import Link from 'next/link';
import { query } from '@/lib/db';
import { currentWeek, leaderboard } from '@/lib/helpers';
import Image from 'next/image';

export default async function Home() {
  const students = await leaderboard();
  const statsRows = await query("SELECT COUNT(*) c, COALESCE(SUM(points),0) p, COALESCE(SUM(revenue),0) r FROM users WHERE role='student'", [], true);
  const stats = {
    c: statsRows?.c || 0,
    p: statsRows?.p || 0,
    r: statsRows?.r || 0,
  };
  let featured = await query("SELECT * FROM users WHERE featured=1 AND role='student' LIMIT 1", [], true);
  if (!featured && students.length > 0) {
    featured = students[0];
  }
  const win = await query('SELECT wins.*, users.name FROM wins LEFT JOIN users ON users.id=wins.user_id WHERE wins.featured=1 ORDER BY wins.id DESC LIMIT 1', [], true);

  return (
    <>
      <section className="home-hero-v2 reveal-up">
        <div className="crazy-bg">
          <div className="c-blob c-blob-1"></div>
          <div className="c-blob c-blob-2"></div>
          <div className="c-blob c-blob-3"></div>
          <div className="c-blob c-blob-4"></div>
          <div className="c-glass"></div>
        </div>

        <div className="hero-copy">
          <p className="eyebrow">Cohort 1 · 90-Day Founder Sprint</p>
          <h1>Learn. Build.<br />Launch with EvolveX.</h1>
          <p className="hero-subtitle">
            A 90-day builder journey where students explore ideas, learn by doing,
            talk to real users, and turn small sparks into working projects.
          </p>
          <div className="hero-actions">
            <Link className="btn big" href="/leaderboard">See the Builders</Link>
            <Link className="btn ghost big" href="/login">Start Building</Link>
          </div>
        </div>
      </section>

      <section className="stats grid-4 reveal-up">
        <div className="stat stagger-in"><b>{stats.c}</b><span>Students</span></div>
        <div className="stat stagger-in"><b>{students.length}</b><span>Projects Live</span></div>
        <div className="stat stagger-in"><b>₹{Math.round(stats.r).toString()}</b><span>Earned Collectively</span></div>
        <div className="stat stagger-in"><b>{currentWeek()}/12</b><span>Cohort Week</span></div>
      </section>

      <section className="process-section reveal-up">
        <div className="section-head">
          <div>
            <p className="eyebrow">90-Day Roadmap</p>
            <h2>Cohort Timeline</h2>
          </div>
          <span>March 21 start · Demo Day at Week 12</span>
        </div>

        <div className="process-scroll-container">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(w => (
            <div key={w} className={`process-card ${w <= currentWeek() ? 'active' : ''} ${w === 12 ? 'demo' : ''}`}>
              <div>
                <div className="process-num">{w < 10 ? `0${w}` : w}</div>
                <h3>Week {w}</h3>
                <p>
                  {w <= currentWeek() ? 'Tasks completed or in progress.' : 
                   w === 12 ? 'The final pitch and Demo Day.' : 'Upcoming week module.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="sticky-container reveal-up">
        <div className="sticky-sidebar">
          <p className="eyebrow">Student Spotlights</p>
          <h2>Celebrating small wins and big leaps.</h2>
        </div>
        
        <div className="sticky-content">
          <div className="spotlight-card stagger-in">
            <p className="eyebrow">Student of the Week</p>

            {featured && (
              <>
                <div className="student-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured.photo} alt={featured.name} />
                  <div>
                    <h2>{featured.name}</h2>
                    <p>{featured.project_name || 'Project pending'} · {featured.stage || 'Profile pending'}</p>
                  </div>
                </div>

                <blockquote>"{featured.quote}"</blockquote>

                <div className="pill">{featured.points} points</div>
              </>
            )}
          </div>

          <div className="win-card-v2 stagger-in">
            <p className="eyebrow">Weekly Highlight</p>

            {win ? (
              <>
                <h2>{win.title}</h2>
                <p>{win.description}</p>
                <span className="pill">{win.name || 'EvolveX'}</span>
              </>
            ) : (
              <>
                <h2>No highlighted win yet.</h2>
                <p>The next student win will appear here.</p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section-head reveal-up">
        <div>
          <p className="eyebrow">Student Projects</p>
          <h2>Ideas currently being shaped</h2>
        </div>
        <span>Public student projects</span>
      </section>

      <section className="grid-3 reveal-up">
        {students.map(s => (
          <Link key={s.id} className="card stagger-in" href={`/student/${s.id}`} style={{ margin: 0, padding: 32, display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'space-between' }}>
            <div>
              <span className="tag">{s.category}</span>
              <h3 style={{ margin: '16px 0 8px' }}>{s.project_name || s.name}</h3>
              <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>{s.one_liner}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 16, marginTop: 16 }}>
              <span className="pill">{s.stage || 'Profile pending'}</span>
              <b style={{ fontSize: 14 }}>View →</b>
            </div>
          </Link>
        ))}
      </section>

      <section className="home-gallery-section reveal-up">
          <div className="gallery-header">
              <p className="eyebrow">Inside EvolveX</p>
              <h2>Building, learning, meeting, and growing together.</h2>
              <p>
                  From rooftop conversations to workshop energy, project expo visits,
                  team meetups, speaker sessions, and founder discussions — this is where
                  the EvolveX journey comes alive.
              </p>
          </div>

          <div className="evolvex-gallery">
              <div className="gallery-card gallery-large stagger-in parallax-img">
                  <Image src="/static/images/team/team.jpg" alt="EvolveX team meetup" fill style={{ objectFit: 'cover' }} sizes="(max-width: 900px) 100vw, 33vw" />
                  <div className="gallery-overlay">
                      <span>Community Moments</span>
                      <h3>Building together</h3>
                  </div>
              </div>

              <div className="gallery-card gallery-tall stagger-in parallax-img">
                  <Image src="/static/images/team/team1.jpg" alt="EvolveX rooftop team" fill style={{ objectFit: 'cover' }} sizes="(max-width: 900px) 100vw, 33vw" />
                  <div className="gallery-overlay">
                      <span>Rooftop Energy</span>
                      <h3>Ideas with a view</h3>
                  </div>
              </div>

              <div className="gallery-card stagger-in">
                  <Image src="/static/images/team/team2.jpg" alt="EvolveX team" fill style={{ objectFit: 'cover' }} sizes="(max-width: 900px) 100vw, 33vw" />
                  <div className="gallery-overlay">
                      <span>Meetups</span>
                      <h3>Showing up</h3>
                  </div>
              </div>

              <div className="gallery-card stagger-in parallax-img">
                  <Image src="/static/images/team/team3.jpg" alt="EvolveX project expo" fill style={{ objectFit: 'cover' }} sizes="(max-width: 900px) 100vw, 33vw" />
                  <div className="gallery-overlay">
                      <span>Exposure</span>
                      <h3>Learning outside rooms</h3>
                  </div>
              </div>

              <div className="gallery-card gallery-wide stagger-in parallax-img">
                  <Image src="/static/images/team/session.jpg" alt="EvolveX speaker session" fill style={{ objectFit: 'cover' }} sizes="(max-width: 900px) 100vw, 33vw" />
                  <div className="gallery-overlay">
                      <span>Speaker Sessions</span>
                      <h3>Listening, questioning, evolving</h3>
                  </div>
              </div>
          </div>
      </section>
    </>
  );
}

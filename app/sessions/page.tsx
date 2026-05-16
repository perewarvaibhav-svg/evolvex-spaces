import Link from 'next/link';
import Image from 'next/image';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Sessions() {
  const sessions = await query('SELECT * FROM sessions_data ORDER BY event_date ASC') as any[];

  return (
    <>
      <div className="journey-hero reveal-up">
        <span className="mini-title">Our Journey</span>
        <h1>Every session shapes the founder.</h1>
      </div>

      {sessions.length > 0 && (
        <div className="journey-tabs reveal-up">
          {sessions.map((s, i) => (
            <div key={i} className="journey-tab">{s.event_type}</div>
          ))}
        </div>
      )}

      <div className="journey-timeline">
        {sessions.length > 0 ? sessions.map((s, i) => (
          <div key={i} className="session-card stagger-in">
            <div className="session-image-box">
              {s.photo_url ? (
                <Image 
                  src={s.photo_url} 
                  alt={s.title} 
                  fill 
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1f1f2e, #3a3a52)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>
                  {s.title.charAt(0)}
                </div>
              )}
              <div className="session-tag">{s.event_type}</div>
            </div>
            <div className="session-content">
              <span className="session-date">{new Date(s.event_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <h2>{s.title}</h2>
              <p>{s.description}</p>
              
              <div className="speaker-box">
                <div>
                  <small>Speaker / Guide</small>
                  <h3>{s.speaker || 'TBA'}</h3>
                </div>
                {s.linkedin && (
                  <Link href={s.linkedin} target="_blank" className="linkedin-btn">
                    Connect ↗
                  </Link>
                )}
              </div>
            </div>
          </div>
        )) : (
          <p className="muted" style={{ textAlign: 'center', width: '100%', padding: '40px 0' }}>No sessions have been added yet.</p>
        )}
      </div>
    </>
  );
}


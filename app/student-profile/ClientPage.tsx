'use client';
import { useState } from 'react';

const STAGES_ARR = ['Idea', 'Validated', 'Prototype', 'First Outreach', 'First Customer', 'Revenue', 'Scaling'];
const CATEGORIES_ARR = ['AI', 'SaaS', 'Community', 'Health', 'Education', 'Fintech', 'Other'];

export default function StudentProfileClient({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  return (
    <>
      <section className="dash-head reveal-up">
        <div>
          <p className="eyebrow">My Account</p>
          <h1>Profile Settings</h1>
          <p className="muted">Manage your public profile, project details, and account security.</p>
        </div>
        <a className="btn ghost" href="/student-dashboard">← Back to Dashboard</a>
      </section>

      {/* Profile preview card */}
      <section className="profile reveal-up" style={{ marginBottom: 40 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {user.photo ? (
          <img src={user.photo} alt={user.name} />
        ) : (
          <div style={{
            width: 160, height: 160, borderRadius: 24,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 56, color: '#fff', fontFamily: 'Instrument Serif, serif',
            flexShrink: 0
          }}>
            {user.name?.charAt(0) || '?'}
          </div>
        )}
        <div>
          <h2 style={{ marginBottom: 4 }}>{user.name}</h2>
          <p style={{ margin: '0 0 8px', color: 'var(--ink-secondary)', fontSize: 15 }}>{user.email}</p>
          {user.project_name && (
            <p style={{ margin: '0 0 16px', fontWeight: 600, color: 'var(--ink-primary)' }}>{user.project_name}</p>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {user.stage && <span className="pill">{user.stage}</span>}
            {user.category && <span className="pill">{user.category}</span>}
            <span className="pill" style={{ background: user.is_public ? '#DCFCE7' : '#FEE2E2', borderColor: user.is_public ? '#86EFAC' : '#FCA5A5', color: user.is_public ? '#166534' : '#991B1B' }}>
              {user.is_public ? '🌐 Public' : '🔒 Private'}
            </span>
          </div>
        </div>
      </section>

      {/* Tab switcher */}
      <div className="tab-buttons" style={{ marginBottom: 32 }}>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          Edit Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
        >
          Password & Security
        </button>
      </div>

      {/* Edit Profile Tab */}
      {activeTab === 'profile' && (
        <div style={{ animation: 'fadeUp 0.35s ease forwards' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

            {/* Basic Info */}
            <section className="card" style={{ margin: 0 }}>
              <h2 style={{ marginBottom: 8 }}>Basic Info</h2>
              <p className="muted" style={{ marginBottom: 24 }}>Your name and photo are shown publicly on the leaderboard and student profiles.</p>
              <form className="form" method="post" action="/api/student/update-profile">
                <label>
                  Full Name
                  <input name="name" defaultValue={user.name} placeholder="Your full name" />
                </label>
                <label>
                  Photo URL
                  <input name="photo" defaultValue={user.photo} placeholder="https://example.com/photo.jpg" />
                </label>
                {/* Pass through unchanged fields */}
                <input type="hidden" name="project_name" defaultValue={user.project_name} />
                <input type="hidden" name="one_liner" defaultValue={user.one_liner} />
                <input type="hidden" name="problem" defaultValue={user.problem} />
                <input type="hidden" name="project_link" defaultValue={user.project_link} />
                <input type="hidden" name="linkedin" defaultValue={user.linkedin} />
                <input type="hidden" name="category" defaultValue={user.category} />
                <input type="hidden" name="stage" defaultValue={user.stage} />
                {user.is_public ? <input type="hidden" name="is_public" value="on" /> : null}
                <button className="btn big">Save Basic Info</button>
              </form>
            </section>

            {/* Project Info */}
            <section className="card" style={{ margin: 0 }}>
              <h2 style={{ marginBottom: 8 }}>Project Details</h2>
              <p className="muted" style={{ marginBottom: 24 }}>Tell the world about what you&apos;re building.</p>
              <form className="form" method="post" action="/api/student/update-profile">
                <label>
                  Project Name
                  <input name="project_name" defaultValue={user.project_name} placeholder="My Startup Name" />
                </label>
                <label>
                  One-liner
                  <input name="one_liner" defaultValue={user.one_liner} placeholder="Describe your project in one sentence" />
                </label>
                <label>
                  Problem
                  <textarea name="problem" defaultValue={user.problem} placeholder="What problem does your project solve?" />
                </label>
                <label>
                  Project Link
                  <input name="project_link" defaultValue={user.project_link} placeholder="https://yourproject.com" />
                </label>
                {/* Pass through unchanged fields */}
                <input type="hidden" name="name" defaultValue={user.name} />
                <input type="hidden" name="photo" defaultValue={user.photo} />
                <input type="hidden" name="linkedin" defaultValue={user.linkedin} />
                <input type="hidden" name="category" defaultValue={user.category} />
                <input type="hidden" name="stage" defaultValue={user.stage} />
                {user.is_public ? <input type="hidden" name="is_public" value="on" /> : null}
                <button className="btn big">Save Project Details</button>
              </form>
            </section>

            {/* Social & Visibility */}
            <section className="card" style={{ margin: 0 }}>
              <h2 style={{ marginBottom: 8 }}>Social & Visibility</h2>
              <p className="muted" style={{ marginBottom: 24 }}>Control your LinkedIn link and whether your project appears on the public directory.</p>
              <form className="form" method="post" action="/api/student/update-profile">
                <label>
                  LinkedIn URL
                  <input name="linkedin" defaultValue={user.linkedin} placeholder="https://linkedin.com/in/yourname" />
                </label>
                <label>
                  Category
                  <select name="category" defaultValue={user.category}>
                    {CATEGORIES_ARR.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label>
                  Stage
                  <select name="stage" defaultValue={user.stage}>
                    {STAGES_ARR.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className="check">
                  <input type="checkbox" name="is_public" defaultChecked={user.is_public === 1} />
                  Make project visible on public directory
                </label>
                {/* Pass through unchanged fields */}
                <input type="hidden" name="name" defaultValue={user.name} />
                <input type="hidden" name="photo" defaultValue={user.photo} />
                <input type="hidden" name="project_name" defaultValue={user.project_name} />
                <input type="hidden" name="one_liner" defaultValue={user.one_liner} />
                <input type="hidden" name="problem" defaultValue={user.problem} />
                <input type="hidden" name="project_link" defaultValue={user.project_link} />
                <button className="btn big">Save Settings</button>
              </form>
            </section>

            {/* Public Profile Preview Link */}
            <section className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ marginBottom: 8 }}>Public Profile</h2>
                <p className="muted">View how your profile looks to other people on the leaderboard and public directory.</p>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                <a className="btn big" href={`/student/${user.id}`} style={{ flex: 1, justifyContent: 'center' }}>
                  View Public Profile →
                </a>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div style={{ maxWidth: 560, animation: 'fadeUp 0.35s ease forwards' }}>
          <section className="card" style={{ margin: 0 }}>
            <h2 style={{ marginBottom: 8 }}>Change Password</h2>
            <p className="muted" style={{ marginBottom: 24 }}>
              Choose a strong password. You&apos;ll be asked to confirm your current password for security.
            </p>
            <form className="form" method="post" action="/api/student/change-password">
              <label>
                Current Password
                <input type="password" name="current_password" required placeholder="Your current password" />
              </label>
              <label>
                New Password
                <input type="password" name="new_password" required placeholder="Min. 8 characters" />
              </label>
              <label>
                Confirm New Password
                <input type="password" name="confirm_password" required placeholder="Repeat new password" />
              </label>
              <button className="btn big">Update Password</button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

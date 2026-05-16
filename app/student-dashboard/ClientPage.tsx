'use client';
import { useState } from 'react';
import { STAGES, CATEGORIES } from '@/lib/helpers'; // need to duplicate arrays here or export from helpers

const STAGES_ARR = ['Idea', 'Validated', 'Prototype', 'First Outreach', 'First Customer', 'Revenue', 'Scaling'];
const CATEGORIES_ARR = ['AI', 'SaaS', 'Community', 'Health', 'Education', 'Fintech', 'Other'];

export default function StudentDashboardClient({
  user, tasks, journey, badges, rank, attendance_events, attendance_history, today_revenue, today_conversation, announcements, current_week
}: any) {
  const [activeTab, setActiveTab] = useState('activity');
  const [selectedWeek, setSelectedWeek] = useState(current_week || 1);

  return (
    <>
      <section className="dash-head reveal-up">
        <div>
          <p className="eyebrow">Student Dashboard</p>
          <h1>Welcome, {user.name}</h1>
          <p className="muted">Update weekly work, complete your profile, log daily revenue/conversations, and mark event attendance.</p>
        </div>
        <a className="btn ghost" href={`/student/${user.id}`}>View public profile</a>
      </section>

      {announcements && announcements.length > 0 && (
        <section className="reveal-up" style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {announcements.map((a: any) => (
            <div key={a.id} className={`flash ${a.priority === 'urgent' ? 'error' : a.priority === 'info' ? 'success' : 'warning'}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <strong style={{ display: 'block', marginBottom: 4 }}>📢 {a.title}</strong>
              <span style={{ fontSize: 14 }}>{a.body}</span>
            </div>
          ))}
        </section>
      )}

      <section className="stats grid-4 reveal-up">
        <div className="stat stagger-in"><b>#{rank || '-'}</b><span>Rank</span></div>
        <div className="stat stagger-in"><b>{user.points}</b><span>Points</span></div>
        <div className="stat stagger-in"><b>{user.tasks_done}</b><span>Tasks Done</span></div>
        <div className="stat stagger-in"><b>₹{Math.round(user.revenue || 0)}</b><span>Revenue</span></div>
      </section>

      {user.must_change_password ? (
        <div className="flash warning reveal-up">Please change your temporary password and complete your profile.</div>
      ) : null}

      <div>
        <section className="card" id="tasks-panel" style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2>My Tasks</h2>
          </div>
          
          <div className="week-slider" style={{ display: 'flex', overflowX: 'auto', gap: 12, paddingBottom: 16, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
            {Array.from({ length: 12 }).map((_, i) => {
              const w = i + 1;
              return (
                <button 
                  key={w}
                  type="button"
                  onClick={() => setSelectedWeek(w)}
                  className={`btn small ${selectedWeek === w ? '' : 'ghost'}`}
                  style={{ whiteSpace: 'nowrap', borderRadius: 20 }}
                >
                  Week {w}
                </button>
              );
            })}
          </div>

          <p className="muted" style={{ marginBottom: 24 }}>Submit your work via GitHub URL, Prototype link, or ZIP file upload.</p>
          
          <div className="kanban" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="lane stagger-in">
              <h3>Pending Tasks</h3>
              {tasks.filter((t: any) => t.week === selectedWeek && t.status !== 'Done').length > 0 ? (
                tasks.filter((t: any) => t.week === selectedWeek && t.status !== 'Done').map((t: any) => (
                  <form key={t.id} className="task-card" method="post" action={`/api/student/task/${t.id}/status`} encType="multipart/form-data">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="pill" style={{ marginBottom: 8 }}>Week {t.week}</span>
                      <span className="points">{t.points} pts</span>
                    </div>
                    <h4>{t.title}</h4>
                    <p>{t.description}</p>
                    <p className="due" data-due={t.due_date}>Due: {t.due_date}</p>
                    <select name="status" defaultValue={t.status}>
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Mark as Done</option>
                    </select>
                    <textarea name="work_note" placeholder="What did you do?" defaultValue={t.work_note || ''}></textarea>
                    
                    <div className="upload-panels" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, padding: '12px', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>GitHub URL</label>
                      <input name="github_url" type="url" placeholder="https://github.com/..." defaultValue={t.proof_link?.includes('github.com') ? t.proof_link : ''} style={{ margin: 0, padding: '8px' }} />
                      
                      <label style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>Prototype Link</label>
                      <input name="prototype_url" type="url" placeholder="Figma, Vercel, Live App..." defaultValue={(!t.proof_link?.includes('github.com') && !t.proof_link?.includes('.zip') && t.proof_link) ? t.proof_link : ''} style={{ margin: 0, padding: '8px' }} />

                      <label style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>ZIP File Upload</label>
                      <input name="file_upload" type="file" accept=".zip" style={{ margin: 0, padding: '8px', background: 'var(--bg)', borderRadius: '4px' }} />
                    </div>

                    <button className="btn">Submit Work</button>
                  </form>
                ))
              ) : (
                <p className="muted">No pending tasks for Week {selectedWeek}.</p>
              )}
            </div>

            <div className="lane stagger-in">
              <h3>Completed Tasks</h3>
              {tasks.filter((t: any) => t.week === selectedWeek && t.status === 'Done').length > 0 ? (
                tasks.filter((t: any) => t.week === selectedWeek && t.status === 'Done').map((t: any) => (
                  <form key={t.id} className="task-card" method="post" action={`/api/student/task/${t.id}/status`} encType="multipart/form-data">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="pill" style={{ marginBottom: 8 }}>Week {t.week}</span>
                      <span className="points" style={{ color: 'var(--success)' }}>{t.points_awarded ?? t.points} pts Earned</span>
                    </div>
                    <h4>{t.title}</h4>
                    <p className="due" style={{ color: 'var(--success)' }}>Submitted on {t.submitted_at?.slice(0, 10)}</p>
                    <textarea name="work_note" placeholder="What did you do?" defaultValue={t.work_note || ''}></textarea>
                    
                    <div className="upload-panels" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, padding: '12px', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>GitHub URL</label>
                      <input name="github_url" type="url" placeholder="https://github.com/..." defaultValue={t.proof_link?.includes('github.com') ? t.proof_link : ''} style={{ margin: 0, padding: '8px' }} />
                      
                      <label style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>Prototype Link</label>
                      <input name="prototype_url" type="url" placeholder="Figma, Vercel, Live App..." defaultValue={(!t.proof_link?.includes('github.com') && !t.proof_link?.includes('.zip') && t.proof_link) ? t.proof_link : ''} style={{ margin: 0, padding: '8px' }} />

                      <label style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>ZIP File Upload</label>
                      <input name="file_upload" type="file" accept=".zip" style={{ margin: 0, padding: '8px', background: 'var(--bg)', borderRadius: '4px' }} />
                    </div>

                    <input type="hidden" name="status" value="Done" />
                    <button className="btn ghost small" style={{ marginTop: 8 }}>Update Submission</button>
                  </form>
                ))
              ) : (
                <p className="muted">No completed tasks for Week {selectedWeek}.</p>
              )}
            </div>
          </div>
        </section>

      </div>

      <div className="tab-buttons">
        <button type="button" onClick={() => setActiveTab('activity')} className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}>Log Activity</button>
        <button type="button" onClick={() => setActiveTab('attendance')} className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}>Attendance</button>
        <button type="button" onClick={() => setActiveTab('journey')} className={`tab-btn ${activeTab === 'journey' ? 'active' : ''}`}>My Journey</button>
      </div>

      <div className={`tab ${activeTab === 'activity' ? 'active' : ''}`} id="activity">
        <div className="grid-2">
          <form className="mini-form" method="post" action="/api/student/activity">
            <input type="hidden" name="type" value="revenue" />
            <h3>Log Revenue</h3>
            <p className="muted">You can submit this only once per day.</p>
            <input name="amount" type="number" placeholder="Amount ₹" disabled={!!today_revenue} />
            <input name="title" placeholder="Revenue source" disabled={!!today_revenue} />
            <textarea name="description" placeholder="Details" disabled={!!today_revenue}></textarea>
            <button className="btn" disabled={!!today_revenue}>{today_revenue ? 'Submitted Today' : 'Add'}</button>
          </form>
          <form className="mini-form" method="post" action="/api/student/activity">
            <input type="hidden" name="type" value="conversation" />
            <h3>Customer Conversation</h3>
            <p className="muted">Select customer count. 5 points per customer. Only once per day.</p>
            <input name="customer_count" type="number" min="1" placeholder="No. of customers spoken to" disabled={!!today_conversation} />
            <input name="title" placeholder="Who did you speak to?" disabled={!!today_conversation} />
            <textarea name="description" placeholder="What happened and outcome?" disabled={!!today_conversation}></textarea>
            <button className="btn" disabled={!!today_conversation}>{today_conversation ? 'Submitted Today' : 'Add'}</button>
          </form>
        </div>
      </div>

      <div className={`tab ${activeTab === 'attendance' ? 'active' : ''}`} id="attendance">
        <h2>Attendance</h2>
        <p className="muted">All admin-created events appear here. Mark attended online/offline, add learning for the day, or give a reason if you did not attend.</p>
        <div className="grid-2">
          {attendance_events.length > 0 ? attendance_events.map((e: any) => (
            <form key={e.id} className="task-card stagger-in" method="post" action={`/api/student/attendance/${e.id}`}>
              <span className="points">{e.points} pts</span>
              <h4>{e.title}</h4>
              <p>{e.event_date} · {e.event_type} · {e.mode}</p>
              <p>{e.description}</p>
              <select name="status" defaultValue={e.status || 'Attended'}>
                <option value="Attended">Attended</option>
                <option value="Not Attended">Not Attended</option>
              </select>
              <select name="mode" defaultValue={e.marked_mode || e.mode || 'Offline'}>
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
              </select>
              <textarea name="takeaway" placeholder="Learning for the day if attended" defaultValue={e.takeaway || ''}></textarea>
              <textarea name="reason" placeholder="Reason if not attended" defaultValue={e.reason || ''}></textarea>
              <button className="btn">{e.status ? 'Update Attendance' : 'Mark Attendance'}</button>
            </form>
          )) : <p className="muted">No upcoming attendance events yet.</p>}
        </div>
        
        <h3>Every Event Attended / Marked</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Event</th><th>Status</th><th>Mode</th><th>Points</th><th>Reason / Learning</th></tr>
            </thead>
            <tbody>
              {attendance_history.length > 0 ? attendance_history.map((a: any, i: number) => (
                <tr key={i}>
                  <td>{a.event_date}</td><td>{a.title}</td><td>{a.status}</td><td>{a.mode}</td><td>{a.points_awarded}</td><td>{a.takeaway || a.reason}</td>
                </tr>
              )) : <tr><td colSpan={6}>No attendance marked yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`tab ${activeTab === 'journey' ? 'active' : ''}`} id="journey">
        <h2>My Journey</h2>
        {badges.map((b: any) => <span key={b.id} className="badge">{b.name}</span>)}
        <div className="journey">
          {journey.length > 0 ? journey.map((j: any) => (
            <div key={j.id}>
              <b>{j.title}</b><span>{j.created_at}</span>
              <p>{j.details}</p>
            </div>
          )) : <p>No journey yet.</p>}
        </div>
      </div>
    </>
  );
}

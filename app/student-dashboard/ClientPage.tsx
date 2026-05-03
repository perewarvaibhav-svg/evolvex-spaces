'use client';
import { STAGES, CATEGORIES } from '@/lib/helpers'; // need to duplicate arrays here or export from helpers

const STAGES_ARR = ['Idea', 'Validated', 'Prototype', 'First Outreach', 'First Customer', 'Revenue', 'Scaling'];
const CATEGORIES_ARR = ['AI', 'SaaS', 'Community', 'Health', 'Education', 'Fintech', 'Other'];

export default function StudentDashboardClient({
  user, tasks, journey, badges, rank, attendance_events, attendance_history, today_revenue, today_conversation, current_week
}: any) {
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

      <section className="stats grid-4 reveal-up">
        <div className="stat stagger-in"><b>#{rank || '-'}</b><span>Rank</span></div>
        <div className="stat stagger-in"><b>{user.points}</b><span>Points</span></div>
        <div className="stat stagger-in"><b>{user.tasks_done}</b><span>Tasks Done</span></div>
        <div className="stat stagger-in"><b>₹{Math.round(user.revenue || 0)}</b><span>Revenue</span></div>
      </section>

      {user.must_change_password ? (
        <div className="flash warning reveal-up">Please change your temporary password and complete your profile.</div>
      ) : null}

      <div className="layout-split">
        <section className="card" id="tasks-panel">
          <h2>Week {current_week} Tasks</h2>
          <div className="kanban">
            {['Not Started', 'In Progress', 'Done'].map(col => (
              <div key={col} className="lane stagger-in">
                <h3>{col}</h3>
                {tasks.filter((t: any) => t.status === col).length > 0 ? (
                  tasks.filter((t: any) => t.status === col).map((t: any) => (
                    <form key={t.id} className="task-card" method="post" action={`/api/student/task/${t.id}/status`}>
                      <span className="points">{t.points} pts</span>
                      <h4>{t.title}</h4>
                      <p>{t.description}</p>
                      <p className="due" data-due={t.due_date}>Due: {t.due_date}</p>
                      <select name="status" defaultValue={t.status}>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                      <textarea name="work_note" placeholder="What did you do?" defaultValue={t.work_note || ''}></textarea>
                      <input name="proof_link" placeholder="Optional proof/screenshot link" defaultValue={t.proof_link || ''} />
                      <button className="btn">Update</button>
                    </form>
                  ))
                ) : (
                  <p className="muted">No tasks here.</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="card" id="profile-panel">
          <h2>Edit Student Profile</h2>
          <form className="form" method="post" action="/api/student/update-profile">
            <label>Name<input name="name" defaultValue={user.name} /></label>
            <label>Photo URL<input name="photo" defaultValue={user.photo} /></label>
            <label>Project Name<input name="project_name" defaultValue={user.project_name} /></label>
            <label>One‑liner<input name="one_liner" defaultValue={user.one_liner} /></label>
            <label>Problem<textarea name="problem" defaultValue={user.problem}></textarea></label>
            <label>Project Link<input name="project_link" defaultValue={user.project_link} /></label>
            <label>LinkedIn<input name="linkedin" defaultValue={user.linkedin} /></label>
            <label>Category
              <select name="category" defaultValue={user.category}>
                {CATEGORIES_ARR.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>Stage
              <select name="stage" defaultValue={user.stage}>
                {STAGES_ARR.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="check">
              <input type="checkbox" name="is_public" defaultChecked={user.is_public === 1} /> 
              Make project public
            </label>
            <button className="btn big">Save Profile</button>
          </form>
          
          <form className="form" method="post" action="/api/student/change-password" style={{ marginTop: 32 }}>
            <h2>Password Manager</h2>
            <p className="muted">Change your password anytime. A confirmation email will be sent.</p>
            <label>Current Password<input type="password" name="current_password" required /></label>
            <label>New Password<input type="password" name="new_password" required /></label>
            <label>Confirm New Password<input type="password" name="confirm_password" required /></label>
            <button className="btn big">Change Password</button>
          </form>
        </section>
      </div>

      <div className="tab-buttons">
        <button className="tab-btn active" data-tab="activity">Log Activity</button>
        <button className="tab-btn" data-tab="attendance">Attendance</button>
        <button className="tab-btn" data-tab="journey">My Journey</button>
      </div>

      <div className="tab active" id="activity">
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

      <div className="tab" id="attendance">
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

      <div className="tab" id="journey">
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

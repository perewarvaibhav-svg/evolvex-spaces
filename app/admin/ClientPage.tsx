'use client';
import Link from 'next/link';
const STAGES_ARR = ['Idea', 'Validated', 'Prototype', 'First Outreach', 'First Customer', 'Revenue', 'Scaling'];
const EVENT_TYPES_ARR = ['Saturday Session', 'Sunday Session', 'Workshop', 'Mentor Session', 'Founder Pitch', 'Offline Meetup', 'Online Session', 'Other'];

export default function AdminDashboardClient({
  students, tasks, wins, attendance_events, access_requests, current_week, today
}: any) {
  return (
    <>
      <section className="dash-head reveal-up">
        <div>
          <p className="eyebrow">Admin Dashboard</p>
          <h1>EvolveX Cohort Control Room</h1>
          <p className="muted">Manage students, tasks, attendance events, reports and wins.</p>
        </div>
        <div>
          <Link className="btn" href="/api/admin/export.csv">Export CSV</Link>{' '}
          <Link className="btn ghost" href="/api/admin/attendance-report.csv">Attendance Report</Link>
        </div>
      </section>

      <div className="tab-buttons" style={{ marginBottom: 32 }}>
        <button className="tab-btn active" data-tab="control-room">Main Control Room</button>
        <button className="tab-btn" data-tab="task-manager">Task Manager</button>
        <button className="tab-btn" data-tab="student-manager">Student Manager</button>
      </div>

      <div className="tab active" id="control-room">
        <section className="card reveal-up stagger-in">
          <h2>Pending Access Requests</h2>
          <p className="muted">Review requests from interns. Approving will create an account and email them a temporary password.</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Requested At</th><th>Actions</th></tr></thead>
              <tbody>
                {access_requests?.length > 0 ? access_requests.map((r: any) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.email}</td>
                    <td>{r.created_at}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <form method="post" action="/api/admin/approve-request" style={{ display: 'inline' }}>
                        <input type="hidden" name="request_id" value={r.id} />
                        <button className="btn small">Approve</button>
                      </form>
                      <form method="post" action="/api/admin/reject-request" style={{ display: 'inline' }}>
                        <input type="hidden" name="request_id" value={r.id} />
                        <button className="btn small ghost" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Reject</button>
                      </form>
                    </td>
                  </tr>
                )) : <tr><td colSpan={4}>No pending requests.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card reveal-up stagger-in">
          <h2>Create Attendance Event</h2>
          <p className="muted">Create Saturday/Sunday or custom events. Students will see it in Attendance tab.</p>
          <form className="form" method="post" action="/api/admin/attendance-event">
            <label>Event Title<input name="title" placeholder="Saturday Founder Session" required /></label>
            <label>Date<input name="event_date" type="date" required /></label>
            <label>Event Type
              <select name="event_type">
                {EVENT_TYPES_ARR.map(e => <option key={e}>{e}</option>)}
              </select>
            </label>
            <label>Mode
              <select name="mode">
                <option>Offline</option><option>Online</option><option>Hybrid</option>
              </select>
            </label>
            <label>Points<input name="points" type="number" defaultValue="15" /></label>
            <label>Description<textarea name="description" placeholder="What is this session about?"></textarea></label>
            <button className="btn">Create Event</button>
          </form>
        </section>

        <section className="card reveal-up stagger-in">
          <h2>Attendance Events</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Title</th><th>Type</th><th>Mode</th><th>Points</th><th>Description</th></tr></thead>
              <tbody>
                {attendance_events.length > 0 ? attendance_events.map((e: any) => (
                  <tr key={e.id}>
                    <td>{e.event_date}</td><td>{e.title}</td><td>{e.event_type}</td><td>{e.mode}</td><td>{e.points}</td><td>{e.description}</td>
                  </tr>
                )) : <tr><td colSpan={6}>No attendance events created yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="tab" id="task-manager">
        <section className="card reveal-up stagger-in">
          <h2>Create Weekly Task</h2>
          <form className="form" method="post" action="/api/admin/task">
            <label>Week<input name="week" type="number" min="1" max="12" defaultValue={current_week} /></label>
            <label>Title<input name="title" required /></label>
            <label>Description<textarea name="description"></textarea></label>
            <label>Points<input name="points" type="number" defaultValue="25" /></label>
            <label>Due Date<input name="due_date" type="date" required /></label>
            <button className="btn">Create Task</button>
          </form>
        </section>

        <section className="card reveal-up stagger-in">
          <h2>Editable Task Manager</h2>
          <p className="muted">Edit upcoming weekly tasks directly here. Changes reflect on student dashboard immediately.</p>
          <div className="table-wrap">
            <table className="task-edit-table">
              <thead><tr><th>Week</th><th>Task</th><th>Description</th><th>Points</th><th>Due Date</th><th>Action</th><th>Delete</th></tr></thead>
              <tbody>
                {tasks.map((t: any) => (
                  <tr key={t.id}>
                    <td colSpan={6} style={{ padding: 0 }}>
                      <form method="post" action="/api/admin/task" style={{ display: 'contents' }}>
                        <input type="hidden" name="task_id" value={t.id} />
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 200px 1fr 100px 150px 80px 80px', padding: 12, alignItems: 'center' }}>
                          <input name="week" type="number" min="1" max="12" defaultValue={t.week} style={{ margin: 0 }} />
                          <input name="title" defaultValue={t.title} style={{ margin: 0 }} />
                          <textarea name="description" defaultValue={t.description} style={{ margin: 0, minHeight: 40 }}></textarea>
                          <input name="points" type="number" defaultValue={t.points} style={{ margin: 0 }} />
                          <input name="due_date" type="date" defaultValue={t.due_date} style={{ margin: 0 }} />
                          <button className="btn small">Save</button>
                          <button formAction={`/api/admin/task/${t.id}/delete`} className="btn small ghost" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>X</button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="tab" id="student-manager">
        <section className="two-col reveal-up">
          <div className="card stagger-in">
            <h2>Add Student Profiles</h2>
            <p className="muted">Paste one email or a comma/new-line separated list. Login setup email with generated password will be sent. In local mode, emails print in terminal.</p>
            <form className="form" method="post" action="/api/admin/add-students">
              <label>Email IDs<textarea name="emails" placeholder="student1@gmail.com, student2@gmail.com" required></textarea></label>
              <button className="btn">Create Students & Send Login</button>
            </form>
          </div>

          <div className="card stagger-in">
            <h2>Wins Board</h2>
            <p className="muted">Select the Student of the Week and optionally add a description.</p>
            <form className="form" method="post" action="/api/admin/win">
              <label>Student of the Week
                <select name="user_id" required>
                  {students.map((s: any) => <option key={s.id} value={s.id} selected={s.featured === 1}>{s.name}</option>)}
                </select>
              </label>
              <label>Description optional<textarea name="description" placeholder="Example: Shipped prototype, spoke to users, or earned first revenue."></textarea></label>
              <label className="check"><input type="checkbox" name="featured" defaultChecked /> Show on public home page</label>
              <button className="btn">Update Wins Board</button>
            </form>
          </div>
        </section>

        <section className="card reveal-up stagger-in">
          <h2>Student Manager</h2>
          <p className="muted">Click any student name to view their public profile. Marking Student of the Week updates the home page and awards a badge.</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Student</th><th>Project</th><th>Points</th><th>Revenue</th><th>Tasks</th><th>Convos</th><th>Sessions</th><th>Controls</th></tr>
              </thead>
              <tbody>
                {students.map((s: any) => (
                  <tr key={s.id} className={s.featured ? 'featured-row' : ''}>
                    <td>
                      <Link className="student-link" href={`/student/${s.id}`}>{s.name}</Link>
                      {s.featured ? <span className="tag">Student of the Week</span> : null}
                      <br /><small>{s.email}</small>
                    </td>
                    <td>{s.project_name}</td>
                    <td><b>{s.points}</b></td>
                    <td>₹{Math.round(s.revenue || 0)}</td>
                    <td>{s.tasks_done}</td>
                    <td>{s.customer_convos}</td>
                    <td>{s.sessions_attended}</td>
                    <td>
                      <form className="inline-form admin-student-form" method="post" action={`/api/admin/student/${s.id}`} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <select name="stage" defaultValue={s.stage}>
                          {STAGES_ARR.map(st => <option key={st}>{st}</option>)}
                        </select>
                        <label className="check"><input type="checkbox" name="featured" defaultChecked={s.featured === 1} /> Student of Week</label>
                        <input name="sow_description" placeholder="Badge description optional" style={{ width: 200 }} />
                        <input name="sow_date" type="date" defaultValue={today} />
                        <label className="check"><input type="checkbox" name="is_public" defaultChecked={s.is_public === 1} /> Public</label>
                        <button className="btn small">Save</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

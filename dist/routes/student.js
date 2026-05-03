"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const helpers_1 = require("../helpers");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// GET /student-dashboard
router.get('/student-dashboard', (0, middleware_1.loginRequired)('student'), async (req, res) => {
    const userId = req.session.user_id;
    const user = await (0, helpers_1.getUser)(userId);
    const tasks = await (0, db_1.query)(`SELECT t.*, COALESCE(s.status,'Not Started') status, s.work_note, s.proof_link, s.submitted_at, s.points_awarded FROM tasks t LEFT JOIN submissions s ON s.task_id=t.id AND s.user_id=? WHERE t.week=? ORDER BY t.due_date, t.id`, [userId, (0, helpers_1.currentWeek)()]);
    const journey = await (0, db_1.query)('SELECT * FROM journey WHERE user_id=? ORDER BY created_at DESC LIMIT 10', [userId]);
    const badges = await (0, db_1.query)('SELECT * FROM badges WHERE user_id=?', [userId]);
    const rankRows = await (0, helpers_1.leaderboard)();
    const rank = rankRows.findIndex((r) => r.id === userId) + 1 || null;
    const attendanceEvents = await (0, db_1.query)(`SELECT e.*, a.status, a.mode marked_mode, a.reason, a.takeaway, a.marked_at FROM attendance_events e LEFT JOIN attendance a ON a.event_id=e.id AND a.user_id=? ORDER BY e.event_date DESC, e.id DESC`, [userId]);
    const attendanceHistory = await (0, db_1.query)(`SELECT e.title, e.event_date, e.event_type, e.mode event_mode, a.status, a.mode, a.reason, a.takeaway, a.points_awarded, a.marked_at FROM attendance a JOIN attendance_events e ON e.id=a.event_id WHERE a.user_id=? ORDER BY e.event_date DESC, a.id DESC`, [userId]);
    const todayRevenue = await (0, db_1.query)('SELECT id FROM activities WHERE user_id=? AND type=? AND date(created_at)=date(?)', [userId, 'revenue', new Date().toISOString()], true);
    const todayConversation = await (0, db_1.query)('SELECT id FROM activities WHERE user_id=? AND type=? AND date(created_at)=date(?)', [userId, 'conversation', new Date().toISOString()], true);
    res.render('student_dashboard.html', { user, tasks, journey, badges, rank, attendance_events: attendanceEvents, attendance_history: attendanceHistory, today_revenue: todayRevenue, today_conversation: todayConversation });
});
// POST /update-profile
router.post('/update-profile', (0, middleware_1.loginRequired)('student'), async (req, res) => {
    const userId = req.session.user_id;
    const fields = ['name', 'photo', 'project_name', 'one_liner', 'problem', 'project_link', 'linkedin', 'category', 'stage'];
    const values = fields.map(f => (req.body[f] || '').trim());
    const isPublic = req.body.is_public ? 1 : 0;
    const setClause = fields.map(f => `${f}=?`).join(', ');
    await (0, db_1.execute)(`UPDATE users SET ${setClause}, is_public=?, must_change_password=0, last_active=? WHERE id=?`, [...values, isPublic, (0, helpers_1.nowIso)(), userId]);
    await (0, db_1.execute)('INSERT INTO journey(user_id,event_type,title,details,created_at) VALUES(?,?,?,?,?)', [userId, 'profile', 'Profile updated', 'Project/profile details changed', (0, helpers_1.nowIso)()]);
    req.flash('success', 'Status updated.');
    res.redirect('/student-dashboard');
});
// POST /change-password
router.post('/change-password', (0, middleware_1.loginRequired)(), async (req, res) => {
    const userId = req.session.user_id;
    const user = await (0, helpers_1.getUser)(userId);
    const { current_password, new_password, confirm_password } = req.body;
    if (!(0, db_1.checkPassword)(current_password, user.password_hash)) {
        req.flash('danger', 'Invalid password.');
    }
    else if ((new_password || '').length < 6) {
        req.flash('warning', 'Invalid password.');
    }
    else if (new_password !== confirm_password) {
        req.flash('warning', 'Invalid password.');
    }
    else {
        await (0, db_1.execute)('UPDATE users SET password_hash=?, must_change_password=0 WHERE id=?', [(0, db_1.hashPassword)(new_password), userId]);
        (0, helpers_1.sendEmail)(user.email, 'Your EvolveX password was changed', `Hi ${user.name},\n\nYour EvolveX account password was changed successfully. If this was not you, contact admin.\n\n- EvolveX Team`);
        req.flash('success', 'Password updated.');
    }
    res.redirect('/dashboard');
});
// POST /task/:id/status
router.post('/task/:task_id/status', (0, middleware_1.loginRequired)('student'), async (req, res) => {
    const userId = req.session.user_id;
    const taskId = parseInt(req.params.task_id, 10);
    const status = req.body.status || 'Not Started';
    const note = (req.body.work_note || '').trim();
    const link = (req.body.proof_link || '').trim();
    const task = await (0, db_1.query)('SELECT * FROM tasks WHERE id=?', [taskId], true);
    const existing = await (0, db_1.query)('SELECT * FROM submissions WHERE user_id=? AND task_id=?', [userId, taskId], true);
    const points = (status === 'Done' && (0, helpers_1.todayIso)() <= task.due_date) ? parseInt(task.points) : 0;
    const submittedAt = status === 'Done' ? (0, helpers_1.nowIso)() : '';
    if (existing) {
        await (0, db_1.execute)('UPDATE submissions SET status=?, work_note=?, proof_link=?, submitted_at=?, points_awarded=? WHERE id=?', [status, note, link, submittedAt || existing.submitted_at, points, existing.id]);
    }
    else {
        await (0, db_1.execute)('INSERT INTO submissions(user_id,task_id,status,work_note,proof_link,submitted_at,points_awarded) VALUES(?,?,?,?,?,?,?)', [userId, taskId, status, note, link, submittedAt, points]);
    }
    await (0, db_1.execute)('INSERT INTO journey(user_id,event_type,title,details,created_at) VALUES(?,?,?,?,?)', [userId, 'task', `${task.title} → ${status}`, note || 'Task status updated', (0, helpers_1.nowIso)()]);
    await (0, helpers_1.recalcUser)(userId);
    req.flash('success', 'Status updated.');
    res.redirect('/student-dashboard');
});
// POST /activity
router.post('/activity', (0, middleware_1.loginRequired)('student'), async (req, res) => {
    const userId = req.session.user_id;
    const typ = req.body.type;
    if (!['revenue', 'conversation'].includes(typ)) {
        req.flash('warning', 'Invalid status.');
        return res.redirect('/student-dashboard');
    }
    const already = await (0, db_1.query)('SELECT id FROM activities WHERE user_id=? AND type=? AND date(created_at)=date(?)', [userId, typ, new Date().toISOString()], true);
    if (already) {
        req.flash('warning', 'Already submitted today.');
        return res.redirect('/student-dashboard');
    }
    const title = (req.body.title || typ.charAt(0).toUpperCase() + typ.slice(1)).trim();
    const desc = (req.body.description || '').trim();
    const amount = parseFloat(req.body.amount || 0);
    const customerCount = typ === 'conversation' ? parseInt(req.body.customer_count || 0) : 0;
    await (0, db_1.execute)('INSERT INTO activities(user_id,type,title,description,amount,customer_count,created_at) VALUES(?,?,?,?,?,?,?)', [userId, typ, title, desc, amount, customerCount, (0, helpers_1.nowIso)()]);
    const details = (typ === 'conversation' ? `Spoke to ${customerCount} customer(s). ` : '') + desc;
    await (0, db_1.execute)('INSERT INTO journey(user_id,event_type,title,details,created_at) VALUES(?,?,?,?,?)', [userId, typ, title, details, (0, helpers_1.nowIso)()]);
    await (0, helpers_1.recalcUser)(userId);
    req.flash('success', 'Status updated.');
    res.redirect('/student-dashboard');
});
// POST /attendance/:event_id
router.post('/attendance/:event_id', (0, middleware_1.loginRequired)('student'), async (req, res) => {
    const userId = req.session.user_id;
    const eventId = parseInt(req.params.event_id, 10);
    const event = await (0, db_1.query)('SELECT * FROM attendance_events WHERE id=?', [eventId], true);
    if (!event) {
        req.flash('danger', 'Invalid status.');
        return res.redirect('/student-dashboard');
    }
    const status = req.body.status || 'Attended';
    const mode = req.body.mode || event.mode;
    const reason = (req.body.reason || '').trim();
    const takeaway = (req.body.takeaway || '').trim();
    const points = status === 'Attended' ? parseInt(event.points || 0) : 0;
    const existing = await (0, db_1.query)('SELECT id FROM attendance WHERE event_id=? AND user_id=?', [eventId, userId], true);
    if (existing) {
        await (0, db_1.execute)('UPDATE attendance SET status=?, mode=?, reason=?, takeaway=?, marked_at=?, points_awarded=? WHERE id=?', [status, mode, reason, takeaway, (0, helpers_1.nowIso)(), points, existing.id]);
    }
    else {
        await (0, db_1.execute)('INSERT INTO attendance(event_id,user_id,status,mode,reason,takeaway,marked_at,points_awarded) VALUES(?,?,?,?,?,?,?,?)', [eventId, userId, status, mode, reason, takeaway, (0, helpers_1.nowIso)(), points]);
    }
    await (0, db_1.execute)('INSERT INTO journey(user_id,event_type,title,details,created_at) VALUES(?,?,?,?,?)', [userId, 'attendance', `${event.title} → ${status}`, status === 'Attended' ? takeaway : `Not attended: ${reason}`, (0, helpers_1.nowIso)()]);
    await (0, helpers_1.recalcUser)(userId);
    req.flash('success', 'Status updated.');
    res.redirect('/student-dashboard');
});
exports.default = router;

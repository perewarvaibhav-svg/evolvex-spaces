"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_TYPES = exports.CATEGORIES = exports.STAGES = exports.COHORT_START = void 0;
exports.currentWeek = currentWeek;
exports.nowIso = nowIso;
exports.todayIso = todayIso;
exports.makePassword = makePassword;
exports.sendEmail = sendEmail;
exports.grantBadge = grantBadge;
exports.awardBadges = awardBadges;
exports.recalcUser = recalcUser;
exports.recordDailyLogin = recordDailyLogin;
exports.leaderboard = leaderboard;
exports.getUser = getUser;
const db_1 = require("./db");
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
exports.COHORT_START = new Date('2026-03-22');
exports.STAGES = ['Idea', 'Validated', 'Prototype', 'First Outreach', 'First Customer', 'Revenue', 'Scaling'];
exports.CATEGORIES = ['AI', 'SaaS', 'Community', 'Health', 'Education', 'Fintech', 'Other'];
exports.EVENT_TYPES = ['Saturday Session', 'Sunday Session', 'Workshop', 'Mentor Session', 'Founder Pitch', 'Offline Meetup', 'Online Session', 'Other'];
function currentWeek() {
    const days = Math.floor((Date.now() - exports.COHORT_START.getTime()) / 86400000);
    return Math.max(1, Math.min(12, Math.floor(days / 7) + 1));
}
function nowIso() {
    return new Date().toISOString().slice(0, 16).replace('T', ' ');
}
function todayIso() {
    return new Date().toISOString().slice(0, 10);
}
function makePassword() {
    return crypto_1.default.randomBytes(8).toString('base64url').slice(0, 10) + '7!';
}
function sendEmail(toEmail, subject, body) {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const username = process.env.SMTP_USERNAME;
    const password = process.env.SMTP_PASSWORD;
    const sender = process.env.MAIL_FROM || username || 'noreply@evolvex.in';
    if (!host || !username || !password) {
        console.log('\n--- EVOLVEX EMAIL PREVIEW ---');
        console.log('To:', toEmail);
        console.log('Subject:', subject);
        console.log(body);
        console.log('--- END EMAIL PREVIEW ---\n');
        return false;
    }
    const transporter = nodemailer_1.default.createTransport({
        host, port,
        secure: process.env.SMTP_USE_SSL === '1' || port === 465,
        auth: { user: username, pass: password },
    });
    transporter.sendMail({ from: sender, to: toEmail, subject, text: body })
        .catch((err) => console.error(`EvolveX email failed for ${toEmail}:`, err));
    return true;
}
async function grantBadge(userId, name, description = '', earnedOn) {
    const on = earnedOn || todayIso();
    const exists = await (0, db_1.query)('SELECT id FROM badges WHERE user_id=? AND name=?', [userId, name], true);
    if (!exists) {
        await (0, db_1.execute)('INSERT INTO badges(user_id,name,description,earned_on) VALUES(?,?,?,?)', [userId, name, description, on]);
        await (0, db_1.execute)('INSERT INTO journey(user_id,event_type,title,details,created_at) VALUES(?,?,?,?,?)', [userId, 'badge', `Badge earned: ${name}`, description || 'Auto-awarded by EvolveX', nowIso()]);
    }
}
async function awardBadges(userId) {
    const stats = await (0, db_1.query)('SELECT points, revenue, customer_convos, login_streak FROM users WHERE id=?', [userId], true);
    if (!stats)
        return;
    if ((stats.points || 0) >= 100)
        await grantBadge(userId, 'Momentum Maker', 'Reached 100+ points through consistent cohort progress.');
    if ((stats.revenue || 0) > 0)
        await grantBadge(userId, 'First Revenue Earned', 'Logged the first earned revenue for their startup.');
    if ((stats.customer_convos || 0) >= 5)
        await grantBadge(userId, 'Talked to 5 Customers', 'Completed five customer conversations.');
    if ((stats.login_streak || 0) >= 4)
        await grantBadge(userId, 'Consistency Champ', 'Logged in for 4+ days in a row.');
}
async function recalcUser(userId) {
    const tasks = await (0, db_1.query)('SELECT COALESCE(SUM(points_awarded),0) total, COUNT(*) cnt FROM submissions WHERE user_id=?', [userId], true);
    const custSum = await (0, db_1.query)("SELECT COALESCE(SUM(customer_count),0) c FROM activities WHERE user_id=? AND type='conversation'", [userId], true);
    const convoDays = await (0, db_1.query)("SELECT COUNT(*) c FROM activities WHERE user_id=? AND type='conversation'", [userId], true);
    const revenue = await (0, db_1.query)("SELECT COALESCE(SUM(amount),0) total FROM activities WHERE user_id=? AND type='revenue'", [userId], true);
    const sessionPts = await (0, db_1.query)("SELECT COALESCE(SUM(points_awarded),0) p FROM attendance WHERE user_id=? AND status='Attended'", [userId], true);
    const sessions = await (0, db_1.query)("SELECT COUNT(*) c FROM attendance WHERE user_id=? AND status='Attended'", [userId], true);
    const totalPts = parseInt(tasks.total || 0) + parseInt(custSum.c || 0) * 5 + parseInt(sessionPts.p || 0);
    const user = await (0, db_1.query)('SELECT login_streak FROM users WHERE id=?', [userId], true);
    const streak = parseInt(user?.login_streak || 0);
    await (0, db_1.execute)('UPDATE users SET points=?, revenue=?, tasks_done=?, customer_convos=?, sessions_attended=?, streak=?, last_active=? WHERE id=?', [totalPts, revenue.total, tasks.cnt, convoDays.c, sessions.c, streak, nowIso(), userId]);
    await awardBadges(userId);
}
async function recordDailyLogin(userId) {
    const user = await (0, db_1.query)('SELECT last_login_date, login_streak FROM users WHERE id=?', [userId], true);
    const today = todayIso();
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (!user || user.last_login_date === today)
        return;
    const newStreak = user.last_login_date === yesterday ? (parseInt(user.login_streak || 0) + 1) : 1;
    await (0, db_1.execute)('UPDATE users SET last_login_date=?, login_streak=?, streak=?, last_active=? WHERE id=?', [today, newStreak, newStreak, nowIso(), userId]);
}
async function leaderboard() {
    return (0, db_1.query)("SELECT * FROM users WHERE role='student' AND is_public=1 AND TRIM(COALESCE(project_name,''))<>'' ORDER BY points DESC, revenue DESC, name ASC");
}
async function getUser(userId) {
    return (0, db_1.query)('SELECT * FROM users WHERE id=?', [userId], true);
}

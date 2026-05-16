import { execute, query, hashPassword } from './db';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const COHORT_START = new Date('2026-03-22');
export const STAGES = ['Idea', 'Validated', 'Prototype', 'First Outreach', 'First Customer', 'Revenue', 'Scaling'];
export const CATEGORIES = ['AI', 'SaaS', 'Community', 'Health', 'Education', 'Fintech', 'Other'];
export const EVENT_TYPES = ['Saturday Session', 'Sunday Session', 'Workshop', 'Mentor Session', 'Founder Pitch', 'Offline Meetup', 'Online Session', 'Other'];

export function currentWeek(): number {
  const days = Math.floor((Date.now() - COHORT_START.getTime()) / 86400000);
  return Math.max(1, Math.min(12, Math.floor(days / 7) + 1));
}

export function nowIso(): string {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function makePassword(): string {
  return crypto.randomBytes(8).toString('base64url').slice(0, 10) + '7!';
}

export function sendEmail(toEmail: string, subject: string, body: string, options?: { bcc?: string, cc?: string }): boolean {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const username = process.env.SMTP_USERNAME;
  const password = process.env.SMTP_PASSWORD;
  const sender = process.env.MAIL_FROM || username || 'noreply@evolvex.in';
  if (!host || !username || !password) {
    console.log('\n--- EVOLVEX EMAIL PREVIEW ---');
    console.log('To:', toEmail);
    if (options?.cc) console.log('CC:', options.cc);
    if (options?.bcc) console.log('BCC:', options.bcc);
    console.log('Subject:', subject);
    console.log(body);
    console.log('--- END EMAIL PREVIEW ---\n');
    return false;
  }
  const transporter = nodemailer.createTransport({
    host, port,
    secure: process.env.SMTP_USE_SSL === '1' || port === 465,
    auth: { user: username, pass: password },
  });
  transporter.sendMail({ from: sender, to: toEmail, subject, text: body, bcc: options?.bcc, cc: options?.cc })
    .catch((err: Error) => console.error(`EvolveX email failed for ${toEmail}:`, err));
  return true;
}

export async function blastEmail(subject: string, body: string): Promise<void> {
  const students = await query("SELECT email FROM users WHERE role='student'");
  const admins = await query("SELECT email FROM users WHERE role='admin'");
  
  const bccList = students.map((s: any) => s.email).filter(Boolean).join(',');
  const ccList = admins.map((a: any) => a.email).filter(Boolean).join(',');
  
  sendEmail('noreply@evolvex.in', subject, body, { bcc: bccList, cc: ccList });
}

export async function grantBadge(userId: number, name: string, description = '', earnedOn?: string): Promise<void> {
  const on = earnedOn || todayIso();
  const exists = await query('SELECT id FROM badges WHERE user_id=? AND name=?', [userId, name], true);
  if (!exists) {
    await execute('INSERT INTO badges(user_id,name,description,earned_on) VALUES(?,?,?,?)', [userId, name, description, on]);
    await execute('INSERT INTO journey(user_id,event_type,title,details,created_at) VALUES(?,?,?,?,?)',
      [userId, 'badge', `Badge earned: ${name}`, description || 'Auto-awarded by EvolveX', nowIso()]);
  }
}

export async function awardBadges(userId: number): Promise<void> {
  const stats: any = await query('SELECT points, revenue, customer_convos, login_streak FROM users WHERE id=?', [userId], true);
  if (!stats) return;
  if ((stats.points || 0) >= 100) await grantBadge(userId, 'Momentum Maker', 'Reached 100+ points through consistent cohort progress.');
  if ((stats.revenue || 0) > 0) await grantBadge(userId, 'First Revenue Earned', 'Logged the first earned revenue for their startup.');
  if ((stats.customer_convos || 0) >= 5) await grantBadge(userId, 'Talked to 5 Customers', 'Completed five customer conversations.');
  if ((stats.login_streak || 0) >= 4) await grantBadge(userId, 'Consistency Champ', 'Logged in for 4+ days in a row.');
}

export async function recalcUser(userId: number): Promise<void> {
  const tasks: any = await query('SELECT COALESCE(SUM(points_awarded),0) total, COUNT(*) cnt FROM submissions WHERE user_id=?', [userId], true);
  const custSum: any = await query("SELECT COALESCE(SUM(customer_count),0) c FROM activities WHERE user_id=? AND type='conversation'", [userId], true);
  const convoDays: any = await query("SELECT COUNT(*) c FROM activities WHERE user_id=? AND type='conversation'", [userId], true);
  const revenue: any = await query("SELECT COALESCE(SUM(amount),0) total FROM activities WHERE user_id=? AND type='revenue'", [userId], true);
  const sessionPts: any = await query("SELECT COALESCE(SUM(points_awarded),0) p FROM attendance WHERE user_id=? AND status='Attended'", [userId], true);
  const sessions: any = await query("SELECT COUNT(*) c FROM attendance WHERE user_id=? AND status='Attended'", [userId], true);
  const totalPts = parseInt(tasks.total || 0) + parseInt(custSum.c || 0) * 5 + parseInt(sessionPts.p || 0);
  const user: any = await query('SELECT login_streak FROM users WHERE id=?', [userId], true);
  const streak = parseInt(user?.login_streak || 0);
  await execute('UPDATE users SET points=?, revenue=?, tasks_done=?, customer_convos=?, sessions_attended=?, streak=?, last_active=? WHERE id=?',
    [totalPts, revenue.total, tasks.cnt, convoDays.c, sessions.c, streak, nowIso(), userId]);
  await awardBadges(userId);
}

export async function recordDailyLogin(userId: number): Promise<void> {
  const user: any = await query('SELECT last_login_date, login_streak FROM users WHERE id=?', [userId], true);
  const today = todayIso();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (!user || user.last_login_date === today) return;
  const newStreak = user.last_login_date === yesterday ? (parseInt(user.login_streak || 0) + 1) : 1;
  await execute('UPDATE users SET last_login_date=?, login_streak=?, streak=?, last_active=? WHERE id=?',
    [today, newStreak, newStreak, nowIso(), userId]);
}

export async function leaderboard(): Promise<any[]> {
  return query("SELECT * FROM users WHERE role='student' AND is_public=1 AND TRIM(COALESCE(project_name,''))<>'' ORDER BY points DESC, revenue DESC, name ASC");
}

export async function getUser(userId: number): Promise<any> {
  return query('SELECT * FROM users WHERE id=?', [userId], true);
}

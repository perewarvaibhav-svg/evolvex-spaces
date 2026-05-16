import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { sendEmail, nowIso } from '@/lib/helpers';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const email = (body.get('email') as string || '').trim().toLowerCase();

  if (!email) {
    return NextResponse.redirect(new URL('/forgot-password?error=Please+enter+an+email.', req.url));
  }

  const user: any = await query('SELECT id, name FROM users WHERE LOWER(email)=?', [email], true);

  // Always show "sent" even if user doesn't exist — prevents email enumeration
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hour

    await execute(
      'INSERT INTO password_reset_tokens(user_id,token,expires_at,used) VALUES(?,?,?,0)',
      [user.id, token, expires]
    );

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    sendEmail(
      email,
      'Reset your EvolveX password',
      `Hi ${user.name},\n\nClick the link below to reset your password. This link expires in 1 hour.\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.\n\n- EvolveX Team`
    );
  }

  return NextResponse.redirect(new URL('/forgot-password?sent=1', req.url));
}

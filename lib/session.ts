import { SessionOptions } from 'iron-session';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  user_id?: number;
  role?: string;
  name?: string;
  flash?: { cat: string; msg: string }[];
}

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_KEY || 'evolvex-dev-secret-key-change-me-32chars',
  cookieName: 'evolvex_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
};

export async function getSession() {
  const c = await cookies();
  const session = await getIronSession<SessionData>(c, sessionOptions);
  return session;
}

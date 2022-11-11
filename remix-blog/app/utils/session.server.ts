import bcrypt from 'bcrypt';
import { db } from './db.server';
import { createCookieSessionStorage, redirect } from '@remix-run/node';

// Login User
export async function login({ username, password }) {
  const user = await db.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) return null;

  // Check password
  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isCorrectPassword) return null;

  return user;
}

// Register new user
export async function register({ username, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return db.user.create({
    data: {
      username,
      passwordHash,
    },
  });
}

// Get session secret
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error('No Session secret');
}

// Session Storage
const storage = createCookieSessionStorage({
  cookie: {
    name: 'remixblog_session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 24 * 60,
    httpOnly: true,
  },
});

// Creste session
export async function createUserSession(userId: string, redirecTo: string) {
  const session = await storage.getSession();
  session.set('userId', userId);
  return redirect(redirecTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  });
}

// Get user session and user
export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'));
}

// Get logged in user
export async function getUser(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId || typeof userId !== 'string') {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}

// Logout and destory session
export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get('Cookie'));
  return redirect('/auth/logout', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  });
}

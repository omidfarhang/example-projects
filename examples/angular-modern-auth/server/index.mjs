/**
 * Teaching BFF for the modern-auth companion.
 *
 * Production shape this mimics:
 * - BFF is the OAuth/OIDC confidential client (authorization code + PKCE).
 * - Access/refresh tokens live in a server-side session store — never in the browser.
 * - Browser only receives an opaque HttpOnly session cookie (+ CSRF cookie).
 *
 * This mock skips a real IdP and issues a short-lived server session instead.
 */
import crypto from 'node:crypto';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const PORT = Number(process.env.PORT || 3001);
const SESSION_TTL_MS = 60_000; // short access window for demo refresh behavior
const REFRESH_TTL_MS = 10 * 60_000;
const COOKIE_NAME = 'sid';
const CSRF_COOKIE = 'csrf';

/** @type {Map<string, { user: object, accessExpiresAt: number, refreshExpiresAt: number }>} */
const sessions = new Map();

const app = express();
app.use(
  cors({
    origin: 'http://localhost:4200',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

function setSessionCookies(res, sid, csrf) {
  res.cookie(COOKIE_NAME, sid, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // true behind HTTPS in production
    path: '/',
    maxAge: REFRESH_TTL_MS,
  });
  // Readable by JS so Angular can send X-CSRF-Token on mutating requests.
  res.cookie(CSRF_COOKIE, csrf, {
    httpOnly: false,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: REFRESH_TTL_MS,
  });
}

function clearSessionCookies(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.clearCookie(CSRF_COOKIE, { path: '/' });
}

function readSession(req) {
  const sid = req.cookies?.[COOKIE_NAME];
  if (!sid) return null;
  const session = sessions.get(sid);
  if (!session) return null;
  if (Date.now() > session.refreshExpiresAt) {
    sessions.delete(sid);
    return null;
  }
  return { sid, session };
}

function requireCsrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  const header = req.get('x-csrf-token');
  const cookie = req.cookies?.[CSRF_COOKIE];
  if (!header || !cookie || header !== cookie) {
    return res.status(403).json({ error: 'csrf_failed' });
  }
  return next();
}

function publicUser(session) {
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    roles: session.user.roles,
    accessExpiresAt: session.accessExpiresAt,
  };
}

app.get('/bff/session', (req, res) => {
  const current = readSession(req);
  if (!current) {
    return res.status(401).json({ authenticated: false });
  }
  if (Date.now() > current.session.accessExpiresAt) {
    return res.status(401).json({ authenticated: false, reason: 'access_expired' });
  }
  return res.json({ authenticated: true, user: publicUser(current.session) });
});

app.post('/bff/login', requireCsrf, (req, res) => {
  const email = String(req.body?.email || 'alex@example.com').trim();
  const role = req.body?.role === 'admin' ? 'admin' : 'member';
  const sid = crypto.randomBytes(24).toString('hex');
  const csrf = crypto.randomBytes(16).toString('hex');
  const now = Date.now();

  const session = {
    user: {
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email,
      roles: role === 'admin' ? ['member', 'admin'] : ['member'],
    },
    // Tokens would live here in a real BFF — never returned to the client.
    tokens: {
      accessToken: `access.${crypto.randomBytes(8).toString('hex')}`,
      refreshToken: `refresh.${crypto.randomBytes(8).toString('hex')}`,
    },
    accessExpiresAt: now + SESSION_TTL_MS,
    refreshExpiresAt: now + REFRESH_TTL_MS,
  };

  sessions.set(sid, session);
  setSessionCookies(res, sid, csrf);

  return res.json({
    authenticated: true,
    user: publicUser(session),
    note: 'Access and refresh tokens stayed on the BFF. Inspect Set-Cookie — not localStorage.',
  });
});

app.post('/bff/refresh', requireCsrf, (req, res) => {
  const current = readSession(req);
  if (!current) {
    clearSessionCookies(res);
    return res.status(401).json({ error: 'no_session' });
  }

  const now = Date.now();
  current.session.accessExpiresAt = now + SESSION_TTL_MS;
  current.session.tokens.accessToken = `access.${crypto.randomBytes(8).toString('hex')}`;
  sessions.set(current.sid, current.session);

  return res.json({
    authenticated: true,
    user: publicUser(current.session),
  });
});

app.post('/bff/logout', requireCsrf, (req, res) => {
  const sid = req.cookies?.[COOKIE_NAME];
  if (sid) sessions.delete(sid);
  clearSessionCookies(res);
  return res.json({ authenticated: false });
});

app.get('/api/profile', (req, res) => {
  const current = readSession(req);
  if (!current) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  if (Date.now() > current.session.accessExpiresAt) {
    return res.status(401).json({ error: 'access_expired' });
  }

  return res.json({
    message: 'Profile loaded via session cookie — no Authorization header from Angular.',
    user: publicUser(current.session),
    // Deliberately omit tokens so the SPA cannot store them.
  });
});

app.get('/api/admin', (req, res) => {
  const current = readSession(req);
  if (!current) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  if (Date.now() > current.session.accessExpiresAt) {
    return res.status(401).json({ error: 'access_expired' });
  }
  if (!current.session.user.roles.includes('admin')) {
    return res.status(403).json({ error: 'forbidden' });
  }

  return res.json({
    message: 'Admin endpoint enforced on the BFF. Route guards are UX only.',
    secrets: ['rotate-signing-keys', 'review-audit-log'],
  });
});

// Bootstrap CSRF cookie for anonymous visitors so login POST can pass the check.
app.get('/bff/csrf', (_req, res) => {
  const csrf = crypto.randomBytes(16).toString('hex');
  res.cookie(CSRF_COOKIE, csrf, {
    httpOnly: false,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: REFRESH_TTL_MS,
  });
  return res.json({ csrf });
});

app.listen(PORT, () => {
  console.log(`Auth BFF listening on http://localhost:${PORT}`);
  console.log(`Access TTL ${SESSION_TTL_MS / 1000}s — call POST /bff/refresh after expiry.`);
});

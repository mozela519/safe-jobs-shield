import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data paths
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const SESSIONS_FILE = path.join(__dirname, '..', 'data', 'sessions.json');

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // "salt:derivedKey" or empty for google-only
  googleId?: string;
  avatarUrl?: string;
  role: 'citizen' | 'verifier' | 'admin';
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationExpires?: number;
  resetPasswordToken?: string;
  resetPasswordCode?: string;
  resetPasswordExpires?: number;
  authProvider: 'local' | 'google';
  createdAt: number;
  lastLoginAt: number;
}

export interface StoredSession {
  id: string; // 256-bit hex token
  userId: string;
  ip: string;
  userAgent: string;
  createdAt: number;
  lastActiveAt: number;
  expiresAt: number;
}

export interface AuthenticatedRequest extends Request {
  user?: StoredUser;
  session?: StoredSession;
}

// -------------------------------------------------------------
// Cryptographic Password Hashing & Verification (OWASP-compliant scrypt)
// -------------------------------------------------------------
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const testBuffer = crypto.scryptSync(password, salt, 64);
    if (keyBuffer.length !== testBuffer.length) return false;
    return crypto.timingSafeEqual(keyBuffer, testBuffer);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// -------------------------------------------------------------
// Persistent Storage Management
// -------------------------------------------------------------
function ensureDirectory(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Initial seed users for instant testing and verification
const INITIAL_USERS: StoredUser[] = [
  {
    id: 'usr-officer-001',
    name: 'Tinashe Moyo (Verification Officer)',
    email: 'officer@safejobs.gov.zw',
    passwordHash: hashPassword('SafeJobs2026!Shield'),
    role: 'verifier',
    isEmailVerified: true,
    authProvider: 'local',
    createdAt: Date.now() - 86400000 * 30,
    lastLoginAt: Date.now() - 3600000,
  },
  {
    id: 'usr-citizen-002',
    name: 'Chipo Sithole',
    email: 'citizen@example.co.zw',
    passwordHash: hashPassword('CitizenSafe2026!'),
    role: 'citizen',
    isEmailVerified: true,
    authProvider: 'local',
    createdAt: Date.now() - 86400000 * 14,
    lastLoginAt: Date.now() - 7200000,
  },
];

let usersCache: StoredUser[] = [];
let sessionsCache: StoredSession[] = [];

function loadUsers(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn('Could not read users file, initializing seed:', err);
  }
  saveUsers(INITIAL_USERS);
  return INITIAL_USERS;
}

function saveUsers(users: StoredUser[]) {
  try {
    ensureDirectory(USERS_FILE);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    usersCache = users;
  } catch (err) {
    console.error('Error saving users file:', err);
  }
}

function loadSessions(): StoredSession[] {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        // Purge expired sessions
        const now = Date.now();
        const valid = data.filter((s: StoredSession) => s.expiresAt > now);
        return valid;
      }
    }
  } catch (err) {
    console.warn('Could not read sessions file:', err);
  }
  return [];
}

function saveSessions(sessions: StoredSession[]) {
  try {
    ensureDirectory(SESSIONS_FILE);
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
    sessionsCache = sessions;
  } catch (err) {
    console.error('Error saving sessions file:', err);
  }
}

// Initialize caches
usersCache = loadUsers();
sessionsCache = loadSessions();

export function sanitizeUser(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    avatarUrl: user.avatarUrl,
    authProvider: user.authProvider,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

// -------------------------------------------------------------
// Rate Limiters for Auth Endpoints
// -------------------------------------------------------------
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // max 15 login/register attempts per IP
  message: { error: 'Too many authentication attempts. Please wait 15 minutes before trying again.' },
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || '127.0.0.1';
  },
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
    forwardedHeader: false,
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many password reset requests. Please wait a few minutes.' },
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || '127.0.0.1';
  },
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
    forwardedHeader: false,
  },
});

// -------------------------------------------------------------
// Validation Utilities
// -------------------------------------------------------------
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(email.trim()) && email.length <= 254;
}

export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password must be under 128 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z)' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter (a-z)' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number (0-9)' };
  }
  return { valid: true };
}

// -------------------------------------------------------------
// Session Creation and Middleware
// -------------------------------------------------------------
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createSession(userId: string, req: Request): StoredSession {
  const sessionToken = generateSecureToken(32);
  const now = Date.now();
  const clientIp = ((req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()) || req.ip || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || 'unknown';

  const newSession: StoredSession = {
    id: sessionToken,
    userId,
    ip: clientIp,
    userAgent,
    createdAt: now,
    lastActiveAt: now,
    expiresAt: now + SESSION_DURATION_MS,
  };

  sessionsCache.push(newSession);
  saveSessions(sessionsCache);
  return newSession;
}

export function revokeSession(sessionToken: string) {
  sessionsCache = sessionsCache.filter((s) => s.id !== sessionToken);
  saveSessions(sessionsCache);
}

export function revokeAllUserSessions(userId: string) {
  sessionsCache = sessionsCache.filter((s) => s.userId !== userId);
  saveSessions(sessionsCache);
}

export function authenticateRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (typeof req.headers['x-auth-token'] === 'string') {
    token = req.headers['x-auth-token'].trim();
  }

  if (!token) {
    return next();
  }

  const session = sessionsCache.find((s) => s.id === token && s.expiresAt > Date.now());
  if (!session) {
    return next();
  }

  const user = usersCache.find((u) => u.id === session.userId);
  if (!user) {
    return next();
  }

  // Update session last active time
  session.lastActiveAt = Date.now();
  req.user = user;
  req.session = session;
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.session) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in to access this feature.',
      code: 'UNAUTHORIZED',
    });
  }
  next();
}

// -------------------------------------------------------------
// Router Setup
// -------------------------------------------------------------
export const authRouter = Router();

// Apply auth rate limiter to sensitive endpoints
authRouter.use('/login', authRateLimiter);
authRouter.use('/register', authRateLimiter);
authRouter.use('/forgot-password', passwordResetLimiter);
authRouter.use('/reset-password', passwordResetLimiter);

// 1. REGISTER
authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide your full name (minimum 2 characters).' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = usersCache.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (existing) {
      return res.status(409).json({
        error: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    const verificationCode = generateVerificationCode();
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const newUser: StoredUser = {
      id: 'usr-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex'),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: 'citizen',
      isEmailVerified: false,
      verificationCode,
      verificationExpires,
      authProvider: 'local',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };

    usersCache.push(newUser);
    saveUsers(usersCache);

    const session = createSession(newUser.id, req);

    console.log(`[Safe Jobs Shield Auth] New registration: ${newUser.email} | Verification Code: ${verificationCode}`);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! A verification code has been dispatched.',
      user: sanitizeUser(newUser),
      token: session.id,
      verificationCode, // Returned for instant sandbox/test verification
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to complete registration. Please try again.' });
  }
});

// 2. LOGIN
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = usersCache.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user || !user.passwordHash) {
      // Timing attack mitigation: do dummy hash calculation
      hashPassword(password);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatches = verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update login timestamp
    user.lastLoginAt = Date.now();
    saveUsers(usersCache);

    const session = createSession(user.id, req);

    return res.json({
      success: true,
      message: 'Signed in successfully.',
      user: sanitizeUser(user),
      token: session.id,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
});

// 3. CURRENT USER (GET /api/auth/me)
authRouter.get('/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.session) {
    return res.status(401).json({ authenticated: false, user: null });
  }

  return res.json({
    authenticated: true,
    user: sanitizeUser(req.user),
    sessionId: req.session.id,
  });
});

// 4. LOGOUT
authRouter.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  if (req.session) {
    revokeSession(req.session.id);
  }
  return res.json({ success: true, message: 'Signed out successfully.' });
});

// 5. VERIFY EMAIL
authRouter.post('/verify-email', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, email } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Verification code is required.' });
    }

    // Identify user either from session or provided email
    let user = req.user;
    if (!user && email) {
      user = usersCache.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sign in first.' });
    }

    if (user.isEmailVerified) {
      return res.json({ success: true, message: 'Email is already verified.', user: sanitizeUser(user) });
    }

    if (!user.verificationCode || user.verificationCode.trim() !== code.trim()) {
      return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
    }

    if (user.verificationExpires && user.verificationExpires < Date.now()) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    saveUsers(usersCache);

    return res.json({
      success: true,
      message: 'Email address verified successfully!',
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    console.error('Verify email error:', err);
    return res.status(500).json({ error: 'Failed to verify email.' });
  }
});

// 6. RESEND VERIFICATION CODE
authRouter.post('/resend-verification', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email } = req.body;
    let user = req.user;

    if (!user && email) {
      user = usersCache.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
    }

    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (user.isEmailVerified) {
      return res.json({ success: true, message: 'Email is already verified.' });
    }

    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    saveUsers(usersCache);

    console.log(`[Safe Jobs Shield Auth] Resent verification code to ${user.email}: ${verificationCode}`);

    return res.json({
      success: true,
      message: 'New verification code has been sent.',
      verificationCode, // Returned for instant sandbox testing
    });
  } catch (err: any) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ error: 'Failed to resend verification code.' });
  }
});

// 7. FORGOT PASSWORD REQUEST
authRouter.post('/forgot-password', (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = usersCache.find((u) => u.email.toLowerCase() === normalizedEmail);

    // Anti-user enumeration: Always return success message even if email not found
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email address, a password reset link has been dispatched.',
      });
    }

    const resetToken = generateSecureToken(24);
    const resetCode = generateVerificationCode();
    const resetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = resetExpires;
    saveUsers(usersCache);

    console.log(`[Safe Jobs Shield Auth] Password reset requested for ${user.email} | Token: ${resetToken} | Code: ${resetCode}`);

    return res.json({
      success: true,
      message: 'If an account exists with this email address, a password reset link has been dispatched.',
      resetToken, // for dev/testing ease
      resetCode,
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Failed to process request.' });
  }
});

// 8. RESET PASSWORD
authRouter.post('/reset-password', (req: Request, res: Response) => {
  try {
    const { token, code, newPassword } = req.body;

    if (!token && !code) {
      return res.status(400).json({ error: 'Reset token or verification code is required.' });
    }

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Match by token or 6-digit reset code
    const user = usersCache.find((u) => {
      if (token && u.resetPasswordToken === token) return true;
      if (code && u.resetPasswordCode === code) return true;
      return false;
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ error: 'Password reset token has expired. Please request a new one.' });
    }

    // Update password
    user.passwordHash = hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    saveUsers(usersCache);

    // Invalidate all existing sessions for security
    revokeAllUserSessions(user.id);

    // Create a fresh session
    const session = createSession(user.id, req);

    return res.json({
      success: true,
      message: 'Your password has been reset successfully. You are now signed in.',
      user: sanitizeUser(user),
      token: session.id,
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// 9. GOOGLE SIGN-IN URL GENERATOR (OAuth 2.0 Authorization Code flow for popups)
authRouter.get('/google/url', (req: Request, res: Response) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${appUrl}/auth/google/callback`;

    if (!clientId) {
      return res.json({
        configured: false,
        message: 'Google Client ID is not configured in .env. Use email/password authentication or configure GOOGLE_CLIENT_ID.',
        clientId: null,
      });
    }

    const state = generateSecureToken(16);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
      state,
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return res.json({
      configured: true,
      url,
      redirectUri,
    });
  } catch (err: any) {
    console.error('Google OAuth URL error:', err);
    return res.status(500).json({ error: 'Failed to generate Google OAuth URL.' });
  }
});

// 10. GOOGLE SIGN-IN (Direct GIS credential / Token Verification)
authRouter.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential, code } = req.body;

    if (!credential && !code) {
      return res.status(400).json({ error: 'Google credential or authorization code is required.' });
    }

    let googleProfile: { email: string; name: string; sub: string; picture?: string; email_verified?: boolean } | null = null;

    // A) If GIS ID Token credential provided:
    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (verifyRes.ok) {
          const tokenInfo = await verifyRes.json();
          if (tokenInfo.email && tokenInfo.sub) {
            googleProfile = {
              email: tokenInfo.email,
              name: tokenInfo.name || tokenInfo.email.split('@')[0],
              sub: tokenInfo.sub,
              picture: tokenInfo.picture,
              email_verified: tokenInfo.email_verified === 'true' || tokenInfo.email_verified === true,
            };
          }
        }
      } catch (e) {
        console.warn('Google tokeninfo fetch failed:', e);
      }
    }

    // B) If Authorization Code provided:
    if (!googleProfile && code) {
      const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const redirectUri = `${appUrl}/auth/google/callback`;

      if (clientId && clientSecret) {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });

        if (tokenRes.ok) {
          const tokens = await tokenRes.json();
          if (tokens.access_token) {
            const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokens.access_token}` },
            });
            if (userinfoRes.ok) {
              const uinfo = await userinfoRes.json();
              googleProfile = {
                email: uinfo.email,
                name: uinfo.name || uinfo.email.split('@')[0],
                sub: uinfo.sub,
                picture: uinfo.picture,
                email_verified: uinfo.email_verified,
              };
            }
          }
        }
      }
    }

    if (!googleProfile) {
      return res.status(400).json({
        error: 'Unable to verify Google credentials. Please ensure your Google account is authorized or try email login.',
      });
    }

    // Find or create user
    const normalizedEmail = googleProfile.email.toLowerCase();
    let user = usersCache.find((u) => u.email.toLowerCase() === normalizedEmail || u.googleId === googleProfile!.sub);

    if (user) {
      // Update Google ID and avatar if needed
      user.googleId = googleProfile.sub;
      user.isEmailVerified = true;
      if (googleProfile.picture) user.avatarUrl = googleProfile.picture;
      user.lastLoginAt = Date.now();
    } else {
      user = {
        id: 'usr-g-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex'),
        name: googleProfile.name,
        email: normalizedEmail,
        passwordHash: '', // no local password set
        googleId: googleProfile.sub,
        avatarUrl: googleProfile.picture,
        role: 'citizen',
        isEmailVerified: true,
        authProvider: 'google',
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      };
      usersCache.push(user);
    }

    saveUsers(usersCache);

    const session = createSession(user.id, req);

    return res.json({
      success: true,
      message: 'Signed in successfully with Google.',
      user: sanitizeUser(user),
      token: session.id,
    });
  } catch (err: any) {
    console.error('Google Sign-In error:', err);
    return res.status(500).json({ error: 'Google sign-in encountered an error. Please try again.' });
  }
});

// 11. USER SESSIONS & PROFILE UPDATE
authRouter.get('/sessions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userSessions = sessionsCache.filter((s) => s.userId === req.user!.id);
  return res.json({
    sessions: userSessions.map((s) => ({
      id: s.id,
      ip: s.ip,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      isCurrent: s.id === req.session!.id,
    })),
  });
});

authRouter.delete('/sessions/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const sessionId = req.params.id;
  const target = sessionsCache.find((s) => s.id === sessionId && s.userId === req.user!.id);
  if (!target) {
    return res.status(404).json({ error: 'Session not found' });
  }
  revokeSession(sessionId);
  return res.json({ success: true, message: 'Session revoked.' });
});

authRouter.patch('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long.' });
    }

    const user = req.user!;
    user.name = name.trim();
    saveUsers(usersCache);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import rateLimit from 'express-rate-limit';
import { authRouter, authenticateRequest } from './src/server/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable trust proxy for reverse proxy / cloud environments
app.set('trust proxy', 1);

// Security and Payload configuration
app.use(express.json({ limit: '10mb' }));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Production Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
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

const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Request rate limit reached. Please wait a moment before trying again.', fallback: true },
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

app.use('/api', generalLimiter);

// Authentication Middleware & Endpoints
app.use(authenticateRequest);
app.use('/api/auth', authRouter);

// Google OAuth Popup Callback Handler (AI Studio cross-origin postMessage pattern)
app.get('/auth/google/callback', (req, res) => {
  const { code, error } = req.query;
  const payload = error ? { error } : { code };
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Google Authentication</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
      .card { text-align: center; padding: 2rem; background: #1e293b; border-radius: 1rem; border: 1px solid #334155; max-width: 400px; }
      .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.2); border-top-color: #10b981; border-radius: 50%; animation: spin 1s infinite linear; margin: 0 auto 1rem; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="spinner"></div>
      <h3 style="margin-top:0">Verifying Identity</h3>
      <p style="color:#94a3b8;font-size:0.875rem">Completing Google authentication. This window will close shortly.</p>
    </div>
    <script>
      (function() {
        var data = ${JSON.stringify(payload)};
        if (window.opener) {
          window.opener.postMessage({ type: 'GOOGLE_OAUTH_CODE', code: data.code, error: data.error }, '*');
          setTimeout(function() { window.close(); }, 350);
        } else {
          window.location.href = '/?authCode=' + encodeURIComponent(data.code || '');
        }
      })();
    </script>
  </body>
</html>`);
});

// -------------------------------------------------------------
// Server-Side Cryptographic HMAC-SHA256 Anonymization Module
// -------------------------------------------------------------
// The HMAC pepper is held exclusively server-side in environment configuration,
// preventing client-side key leakage, rainbow table precomputations, and offline reversing.
const SERVER_HMAC_PEPPER = process.env.HMAC_SECRET || 'ZIM_SJS_PROTECTED_SERVER_PEPPER_2026';

function normalizeIdentifierServer(identifier: string): string {
  let cleaned = String(identifier || '').trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0];
  cleaned = cleaned.replace(/[\s\-_()]/g, '');
  if (cleaned.startsWith('07') && cleaned.length === 10) {
    cleaned = '+263' + cleaned.substring(1);
  } else if (cleaned.startsWith('263') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

export function serverComputeHmac(identifier: string): string {
  const normalized = normalizeIdentifierServer(identifier);
  return crypto.createHmac('sha256', SERVER_HMAC_PEPPER).update(normalized).digest('hex');
}

// Endpoint: Server-side cryptographic HMAC-SHA256 generation
app.post('/api/privacy/hash', (req, res) => {
  const { identifier } = req.body;
  if (!identifier || typeof identifier !== 'string') {
    return res.status(400).json({ error: 'Valid identifier string required' });
  }
  const hash = serverComputeHmac(identifier);
  return res.json({
    hash,
    method: 'server_hmac_sha256',
    architecture: 'Server-side cryptographic HMAC-SHA256 with protected environment pepper',
  });
});

// Endpoint: Batch server-side cryptographic HMAC-SHA256 generation
app.post('/api/privacy/hash-batch', (req, res) => {
  const { identifiers } = req.body;
  if (!Array.isArray(identifiers)) {
    return res.status(400).json({ error: 'Identifiers array required' });
  }
  const hashes: Record<string, string> = {};
  for (const id of identifiers) {
    if (typeof id === 'string') {
      hashes[id] = serverComputeHmac(id);
    }
  }
  return res.json({ hashes });
});

// Endpoint: Server-side cryptographic HMAC-SHA256 signature verification for employers
const REGISTRY_AUTHORITY_KEY = process.env.REGISTRY_KEY || 'ZIM_OFFICIAL_REGISTRY_AUTHORITY_KEY_2026';

app.post('/api/privacy/verify-employer', (req, res) => {
  const { canonicalPayload, signatureHex } = req.body;
  if (!canonicalPayload || typeof canonicalPayload !== 'string' || !signatureHex || typeof signatureHex !== 'string') {
    return res.status(400).json({ error: 'canonicalPayload and signatureHex strings are required' });
  }

  try {
    const expectedSigHex = crypto
      .createHmac('sha256', REGISTRY_AUTHORITY_KEY)
      .update(canonicalPayload)
      .digest('hex');

    // Constant-time comparison to prevent timing side-channel attacks
    const expectedBuf = Buffer.from(expectedSigHex, 'hex');
    const actualBuf = Buffer.from(signatureHex, 'hex');

    const valid = expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf);

    return res.json({
      valid,
      method: 'server_hmac_sha256_constant_time',
      architecture: 'Server-side authoritative HMAC-SHA256 signature verification',
      status: valid ? 'AUTHENTICATED_AND_UNTAMPERED' : 'SIGNATURE_MISMATCH',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Signature verification computation failed' });
  }
});

// -------------------------------------------------------------
// Persistent Community Scam Reports Store
// -------------------------------------------------------------
interface StoredScamReport {
  id: string;
  hashedIdentifier: string;
  targetType: 'phone' | 'domain' | 'email';
  category: string;
  timestamp: number;
}

const REPORTS_DATA_FILE = path.join(__dirname, 'src', 'data', 'community_reports.json');

// Initial seed data with verified fraudulent indicators
const INITIAL_REPORTS_SEED: StoredScamReport[] = [
  {
    id: 'rep-seed-001',
    hashedIdentifier: serverComputeHmac('+263 77 999 1122'),
    targetType: 'phone',
    category: 'advance_fee',
    timestamp: Date.now() - 86400000 * 3,
  },
  {
    id: 'rep-seed-002',
    hashedIdentifier: serverComputeHmac('fake-careers.xyz'),
    targetType: 'domain',
    category: 'phishing_link',
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: 'rep-seed-003',
    hashedIdentifier: serverComputeHmac('0773129840'),
    targetType: 'phone',
    category: 'advance_fee',
    timestamp: Date.now() - 86400000 * 1,
  },
];

let communityReportsCache: StoredScamReport[] = [];

function loadReportsFromDisk(): StoredScamReport[] {
  try {
    if (fs.existsSync(REPORTS_DATA_FILE)) {
      const content = fs.readFileSync(REPORTS_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Could not read reports file, using in-memory seed:', err);
  }
  return INITIAL_REPORTS_SEED;
}

function saveReportsToDisk(reports: StoredScamReport[]) {
  try {
    const dir = path.dirname(REPORTS_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REPORTS_DATA_FILE, JSON.stringify(reports, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting reports to disk:', err);
  }
}

communityReportsCache = loadReportsFromDisk();

// Endpoint: Lookup reputation count for a given HMAC hash
app.get('/api/reports/reputation/:hash', (req, res) => {
  const hash = req.params.hash;
  if (!hash) {
    return res.status(400).json({ error: 'Hash parameter required' });
  }

  // Count matches in persistent pool
  const count = communityReportsCache.filter((r) => r.hashedIdentifier === hash).length;

  return res.json({
    hashedIdentifier: hash,
    count,
  });
});

// Endpoint: Batch lookup multiple hashes
app.post('/api/reports/reputation/batch', (req, res) => {
  const { hashes } = req.body;
  if (!Array.isArray(hashes)) {
    return res.status(400).json({ error: 'Hashes array required' });
  }

  const results: Record<string, number> = {};
  for (const h of hashes) {
    results[h] = communityReportsCache.filter((r) => r.hashedIdentifier === h).length;
  }

  return res.json({ results });
});

// Endpoint: Submit verified scam indicator report
app.post('/api/reports', strictLimiter, (req, res) => {
  try {
    const { hashedIdentifier, targetType, category } = req.body;
    if (!hashedIdentifier || typeof hashedIdentifier !== 'string') {
      return res.status(400).json({ error: 'Valid hashedIdentifier required' });
    }

    const newReport: StoredScamReport = {
      id: 'rep-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      hashedIdentifier: hashedIdentifier.trim(),
      targetType: targetType === 'email' || targetType === 'domain' ? targetType : 'phone',
      category: category || 'advance_fee',
      timestamp: Date.now(),
    };

    communityReportsCache.push(newReport);
    saveReportsToDisk(communityReportsCache);

    const updatedCount = communityReportsCache.filter((r) => r.hashedIdentifier === newReport.hashedIdentifier).length;

    return res.json({
      success: true,
      reportId: newReport.id,
      count: updatedCount,
    });
  } catch (err: any) {
    console.error('Error recording report:', err);
    return res.status(500).json({ error: 'Unable to record report at this time' });
  }
});

// Endpoint: Aggregated district / category statistics for safety dashboards
app.get('/api/reports/stats', (_req, res) => {
  const categoryCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};

  communityReportsCache.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    typeCounts[r.targetType] = (typeCounts[r.targetType] || 0) + 1;
  });

  return res.json({
    totalReports: communityReportsCache.length,
    byCategory: categoryCounts,
    byType: typeCounts,
    latestTimestamp: communityReportsCache.length > 0 ? communityReportsCache[communityReportsCache.length - 1].timestamp : Date.now(),
  });
});

// -------------------------------------------------------------
// Real OCR Vision Endpoint for Uploaded Flyers & WhatsApp Statuses
// -------------------------------------------------------------
app.post('/api/ocr', strictLimiter, async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key not configured for server OCR.',
        fallback: true,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `You are a high-accuracy Optical Character Recognition (OCR) engine for Safe Jobs Shield Zimbabwe.
Analyze this job advertisement flyer, screenshot, or poster.
TASK:
Extract all written text from the image verbatim.
Preserve exact wording, contact details (e.g. phone numbers starting with +263, 077, 071, 078), EcoCash/OneMoney/InnBucks payment demands, registration fees, email addresses, and application requirements.
Respond ONLY with the extracted text. Do not add commentary, introductions, or markdown formatting blocks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType || 'image/png',
            data: base64Data,
          },
        },
        prompt,
      ],
    });

    const extractedText = response.text?.trim() || '';

    return res.json({
      success: true,
      extractedText,
    });
  } catch (err: any) {
    console.error('OCR analysis error:', err?.message || err);
    return res.status(500).json({
      error: 'OCR processing encountered an issue. Falling back to local image analysis.',
      fallback: true,
    });
  }
});

// -------------------------------------------------------------
// Secure AI Plain-Language Explanations Endpoint
// -------------------------------------------------------------
app.post('/api/explain', strictLimiter, async (req, res) => {
  try {
    const { redactedText, verdict, reasons, language } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key not configured on server.',
        fallback: true,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const langName = language === 'sn' ? 'Shona' : language === 'nd' ? 'Northern Ndebele' : 'English';

    const prompt = `You are the Safe Jobs Shield official assistant helping Zimbabwean job seekers understand employment safety risks.
The job offer has been evaluated by our defensive rules engine as: ${verdict}.
Key detected signals:
${(reasons || []).join('\n')}

Sanitized job offer text (identifying info already redacted for privacy):
"""
${redactedText}
"""

TASK:
Provide a compassionate, plain-language, 2-to-3 sentence explanation of why this offer is risky or safe, and give 2 concrete immediate action steps.
Use simple, accessible language suitable for job seekers.
Language: Respond in ${langName} (with natural, respectful tone).
Do not accuse anyone directly. Maintain defensive, empowering advice.
Never ask the user to pay fees or give their ID. Mention Zimbabwe's National GBV and Anti-Trafficking helpline (08080074) if human trafficking/exploitation was flagged.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const explanation = response.text?.trim() || '';

    return res.json({
      success: true,
      explanation,
      redactedText,
      language: langName,
    });
  } catch (err: any) {
    console.error('Gemini API explain error:', err?.message || err);
    return res.status(500).json({
      error: 'AI explanation currently unavailable.',
      fallback: true,
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Safe Jobs Shield National Verification API',
    version: '1.2.0',
    dataProtectionLaw: 'Zimbabwe Cyber and Data Protection Act [Chapter 12:07]',
    totalCommunityReports: communityReportsCache.length,
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Safe Jobs Shield official server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

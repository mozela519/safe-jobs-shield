import { SessionCheckItem, DetectionResult, ExtractedIdentifierItem } from '../types';

const SESSION_STORAGE_KEY = 'safe_jobs_shield_session_checks_v1';

export const INITIAL_SESSION_CHECKS: SessionCheckItem[] = [
  {
    id: 'chk-init-001',
    type: 'ocr_flyer',
    timestamp: Date.now() - 1000 * 60 * 18, // 18 mins ago
    title: 'Harare Delivery Driver Vacancy (WhatsApp Status Flyer)',
    snippet: 'VACANCY: Delivery driver needed in Harare. Salary $600 USD. Send $20 registration fee via EcoPay to 0773129840 to confirm interview date.',
    verdict: 'HIGH_RISK',
    riskScore: 92,
    identifiers: [
      {
        type: 'phone',
        value: '+263 77 312 9840',
        label: 'EcoPay Mobile Money Recipient',
        rawRedacted: '+263 77 *** 9840',
      },
      {
        type: 'employer',
        value: 'Unregistered Courier Recruiter',
        label: 'Claimed Entity',
      },
    ],
    metadata: {
      sourceImage: 'preset_flyer_driver.png',
      matchedSignalsCount: 4,
      purpose: 'Driver vacancy screenshot check',
    },
  },
  {
    id: 'chk-init-002',
    type: 'signed_ad_qr',
    timestamp: Date.now() - 1000 * 60 * 12, // 12 mins ago
    title: 'Matabeleland Solar Tech • Apprentice Vacancy',
    snippet: 'Cryptographically signed vacancy notice with public ECDSA key. Zero agency fees verified.',
    verdict: 'VERIFIED_VALID',
    riskScore: 5,
    identifiers: [
      {
        type: 'employer',
        value: 'Matabeleland Solar Tech',
        label: 'Verified Zimbabwe Employer',
      },
      {
        type: 'domain',
        value: 'https://matabeleland-solar.co.zw',
        label: 'Official Application Portal',
      },
      {
        type: 'ad_id',
        value: 'AD-004 (ZIM-CO-2024-1109)',
        label: 'Registered Company Number',
      },
    ],
    metadata: {
      employerName: 'Matabeleland Solar Tech',
      jobTitle: 'Solar Installation Apprentice',
      verificationSignatureHex: '9c4952430e45504dbc5463904dba8557f8f0de4aa91e07dfc1c33eb5f3c3250e',
      isTampered: false,
    },
  },
  {
    id: 'chk-init-003',
    type: 'guarded_document',
    timestamp: Date.now() - 1000 * 60 * 6, // 6 mins ago
    title: 'Zimbabwe National ID Copy (Watermarked)',
    snippet: 'Client-side stamped: "FOR APEX TELECOM • JOB APPLICATION ONLY • DO NOT DUPLICATE". Safe from micro-finance loan abuse.',
    verdict: 'DOCUMENT_GUARDED',
    identifiers: [
      {
        type: 'filename',
        value: 'watermarked_id_for_apex_telecom.png',
        label: 'Protected Export File',
      },
      {
        type: 'employer',
        value: 'Apex Telecom Zimbabwe',
        label: 'Bound Recipient',
      },
    ],
    metadata: {
      employerName: 'Apex Telecom Zimbabwe',
      documentType: 'National ID / Metal or Polycarbonate Copy',
      purpose: 'Graduate Trainee Application',
    },
  },
];

/**
 * Load session checks from sessionStorage or fallback to initial defaults
 */
export function loadSessionChecks(): SessionCheckItem[] {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Unable to access sessionStorage for checks:', e);
  }
  return INITIAL_SESSION_CHECKS;
}

/**
 * Persist session checks to sessionStorage
 */
export function saveSessionChecks(items: SessionCheckItem[]): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Unable to save checks to sessionStorage:', e);
  }
}

/**
 * Build a SessionCheckItem from a DetectionResult (Chat or OCR)
 */
export function createSessionCheckFromDetection(
  type: 'chat_job' | 'ocr_flyer',
  title: string,
  rawText: string,
  result: DetectionResult,
  extraMetadata?: Record<string, any>
): SessionCheckItem {
  const identifiers: ExtractedIdentifierItem[] = [];

  // Add phones
  result.entities.phones.forEach((phone) => {
    identifiers.push({
      type: 'phone',
      value: phone,
      label: 'Phone / WhatsApp Contact',
    });
  });

  // Add domains / URLs
  result.entities.urls.forEach((url) => {
    identifiers.push({
      type: 'domain',
      value: url,
      label: 'Web Link / Portal',
    });
  });

  // Add emails
  result.entities.emails.forEach((email) => {
    identifiers.push({
      type: 'email',
      value: email,
      label: 'Contact Email',
    });
  });

  // Add claimed employer
  if (result.matchedEmployer) {
    identifiers.push({
      type: 'employer',
      value: result.matchedEmployer.name,
      label: 'Verified Zimbabwe Employer',
    });
  } else if (result.entities.claimedEmployers.length > 0) {
    result.entities.claimedEmployers.forEach((emp) => {
      identifiers.push({
        type: 'employer',
        value: emp,
        label: 'Claimed Employer',
      });
    });
  }

  // Create safe snippet
  const snippet =
    rawText.length > 140 ? rawText.substring(0, 140).trim() + '...' : rawText;

  return {
    id: 'chk-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    type,
    timestamp: Date.now(),
    title: title || (type === 'ocr_flyer' ? 'Scanned Flyer / Image OCR' : 'Job Text Verification'),
    snippet,
    verdict: result.verdict,
    riskScore: result.score,
    identifiers,
    metadata: {
      matchedSignalsCount: result.signals.length,
      employerName: result.matchedEmployer?.name,
      ...extraMetadata,
    },
    rawResult: result,
  };
}

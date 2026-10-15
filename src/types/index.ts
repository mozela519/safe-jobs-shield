/**
 * Safe Jobs Shield - Type Definitions
 * Zimbabwe Youth Innovation HackLab 2026
 */

export type Language = 'en' | 'sn' | 'nd';

export type RiskVerdict = 'LOW_RISK' | 'SUSPICIOUS' | 'HIGH_RISK' | 'NOT_ENOUGH_INFO';

export type AppTab =
  | 'chat'
  | 'docguard'
  | 'ocr'
  | 'lookalike'
  | 'signedads'
  | 'recovery'
  | 'employers'
  | 'roadmap'
  | 'privacy'
  | 'report'
  | 'tests'
  | 'inclusion'
  | 'howitworks'
  | 'mychecks'
  | 'auth'
  | 'account'
  | 'threatmodel';

export type SignalSeverity = 'critical' | 'high' | 'medium' | 'positive' | 'neutral';

export type SignalCategory =
  | 'fee'
  | 'identity'
  | 'contact'
  | 'urgency'
  | 'salary'
  | 'privacy'
  | 'trafficking'
  | 'link'
  | 'reputation'
  | 'legitimacy';

export interface LocalizedText {
  en: string;
  sn: string;
  nd: string;
  _needsNativeSpeakerReview?: boolean;
}

export interface SignalResult {
  id: string;
  category: SignalCategory;
  severity: SignalSeverity;
  weight: number; // Positive increases risk score, negative decreases risk
  label: LocalizedText;
  description: LocalizedText;
  matchedKeywords?: string[];
}

export interface HelplineInfo {
  name: string;
  number: string;
  freephone: boolean;
  hours: string;
  description: LocalizedText;
}

export interface VerifiedEmployer {
  id: string;
  name: string;
  registrationNumber: string;
  sector: string;
  domain: string;
  officialPhone: string;
  physicalAddress: string;
  verifiedDate: string;
  badgeType: 'CERTIFIED_SAFE' | 'FORMAL_RECRUITER' | 'YOUTH_PATHWAY';
  publicKeyPem: string;
  signatureHex: string;
  canonicalPayload: string;
  activeHiring: boolean;
  openPositions: string[];
}

export interface ExtractedEntities {
  phones: string[];
  emails: string[];
  urls: string[];
  claimedEmployers: string[];
  hashedIdentifiers: { rawType: 'phone' | 'domain' | 'email'; hashed: string; rawRedacted: string }[];
}

export interface DetectionResult {
  score: number; // 0 to 100
  verdict: RiskVerdict;
  verdictLabel: LocalizedText;
  summary: LocalizedText;
  signals: SignalResult[];
  positiveSignals: SignalResult[];
  actionAdvice: {
    en: string[];
    sn: string[];
    nd: string[];
  };
  isEmergencyOrTrafficking: boolean;
  helplineInfo?: HelplineInfo;
  redactedText: string;
  entities: ExtractedEntities;
  matchedEmployer?: VerifiedEmployer | null;
  employerSignatureValid?: boolean;
  evaluationTimestamp: number;
  aiExplanation?: string;
  aiLoading?: boolean;
  aiError?: string;
}

export interface ScamReport {
  id: string;
  hashedIdentifier: string;
  targetType: 'phone' | 'domain' | 'email';
  category: string;
  timestamp: number;
  notesRedacted?: string;
}

export interface SampleMessage {
  id: string;
  title: string;
  category: 'scam' | 'legitimate' | 'ambiguous';
  scamType?: string;
  languageLabel: string;
  sender: string;
  text: string;
  expectedVerdict: RiskVerdict;
  shortDescription: string;
}

export interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedVerdict: RiskVerdict;
  expectedMinScore?: number;
  expectedMaxScore?: number;
  expectedSignalId?: string;
  description: string;
}

export type CheckType =
  | 'chat_job'
  | 'ocr_flyer'
  | 'signed_ad_qr'
  | 'guarded_document'
  | 'lookalike_domain';

export interface ExtractedIdentifierItem {
  type: 'phone' | 'email' | 'domain' | 'employer' | 'ad_id' | 'filename';
  value: string;
  label?: string;
  rawRedacted?: string;
}

export type SessionCheckVerdict =
  | RiskVerdict
  | 'VERIFIED_VALID'
  | 'VERIFIED_TAMPERED'
  | 'DOCUMENT_GUARDED';

export interface SessionCheckItem {
  id: string;
  type: CheckType;
  timestamp: number;
  title: string;
  snippet: string;
  verdict: SessionCheckVerdict;
  riskScore?: number;
  identifiers: ExtractedIdentifierItem[];
  metadata?: {
    employerName?: string;
    jobTitle?: string;
    documentType?: string;
    purpose?: string;
    sourceImage?: string;
    matchedSignalsCount?: number;
    isTampered?: boolean;
    verificationSignatureHex?: string;
  };
  rawResult?: DetectionResult;
}

export type UserRole = 'citizen' | 'verifier' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  avatarUrl?: string;
  authProvider: 'local' | 'google';
  createdAt: number;
  lastLoginAt?: number;
}

export interface AuthSession {
  id: string;
  userId: string;
  ip?: string;
  userAgent?: string;
  createdAt: number;
  expiresAt: number;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  verificationCode?: string; // provided in dev/testing mode
  message?: string;
}

export type AuthViewMode =
  | 'login'
  | 'register'
  | 'verify_email'
  | 'forgot_password'
  | 'reset_password'
  | 'account';

import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { computeHmacSha256, normalizeIdentifier, redactPII } from '../crypto/privacy';
import {
  ShieldCheck,
  Lock,
  Key,
  Database,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Hash,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';

interface PrivacyPanelProps {
  language: Language;
}

export const PrivacyPanel: React.FC<PrivacyPanelProps> = ({ language }) => {
  const t = translations[language];
  const [demoInput, setDemoInput] = useState('+263 77 912 3456');
  const [computedHash, setComputedHash] = useState('');
  const [normalized, setNormalized] = useState('');
  const [redactedPreview, setRedactedPreview] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function updateDemo() {
      if (!demoInput.trim()) {
        setComputedHash('');
        setNormalized('');
        setRedactedPreview('');
        return;
      }
      const norm = normalizeIdentifier(demoInput);
      setNormalized(norm);

      const { redactedText } = redactPII(`Contact recruiter on ${demoInput} immediately.`);
      setRedactedPreview(redactedText);

      const hash = await computeHmacSha256(demoInput);
      setComputedHash(hash);
    }
    updateDemo();
  }, [demoInput]);

  const handleCopy = () => {
    navigator.clipboard.writeText(computedHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Lock className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
            Privacy-by-Design Architecture
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {t.privacyTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
          {t.privacySubtitle}. Safe Jobs Shield operates under a strict defensive privacy framework. We do not store raw job messages, applicant phone numbers, or cleartext recruiter contacts.
        </p>
      </div>

      {/* Interactive Live Hashing Sandbox */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              {t.hashingDemoTitle}
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Type any sample phone number, email or link below to see how our cryptographic pipeline ensures zero cleartext leakage:
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sample Input (e.g. Recruiter Mobile or Suspicious Domain):
            </label>
            <input
              type="text"
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              placeholder={t.hashingDemoInputPlaceholder}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Normalized representation */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-500 block mb-0.5">
                1. Standardized Normalization (E.164):
              </span>
              <span className="font-mono text-slate-900 font-bold">
                {normalized || '(Waiting for input...)'}
              </span>
            </div>

            {/* Redaction preview */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-500 block mb-0.5">
                2. PII Sanitization Preview (Before External API):
              </span>
              <span className="font-mono text-purple-900">
                {redactedPreview || '(Waiting for input...)'}
              </span>
            </div>
          </div>

          {/* Cryptographic Hash Result */}
          <div className="bg-emerald-50/80 border border-emerald-300 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span>Server-Side HMAC-SHA256 Anonymization Result:</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!computedHash}
                className="text-[11px] text-emerald-800 hover:text-emerald-950 flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-200/60 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied Hash' : 'Copy Hash'}</span>
              </button>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-200 font-mono text-xs text-emerald-900 break-all select-all font-semibold">
              {computedHash || 'Calculating...'}
            </div>
            <div className="flex items-center justify-between text-[10px] text-emerald-800 pt-1">
              <span>Endpoint: <code>POST /api/privacy/hash</code></span>
              <span className="bg-emerald-200/60 font-semibold px-2 py-0.5 rounded">Isolated Server Pepper</span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed pt-1">
              {t.hashingDemoExplainer} Cryptographic HMAC-SHA256 hashing is executed strictly server-side so client secrets are never exposed to browser reverse-engineering or offline rainbow-table precomputations.
            </p>
          </div>
        </div>
      </div>

      {/* Legal & Policy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg w-fit">
            <Database className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            What We Store
          </h4>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li><strong>Server-side HMAC-SHA256</strong> irreversible digests only.</li>
            <li>Categorical threat labels (e.g. &quot;advance_fee&quot;).</li>
            <li>Zero cleartext phone numbers or conversation text.</li>
            <li>Optional user account syncs only zero-knowledge hashes.</li>
          </ul>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2 bg-rose-100 text-rose-800 rounded-lg w-fit">
            <EyeOff className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            What We NEVER Store
          </h4>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>Raw applicant messages, resumes, or chat transcripts.</li>
            <li>Applicant personal phone numbers or ID photos.</li>
            <li>Recruiter names, cleartext messages, or bank pins.</li>
            <li>IP addresses or GPS location tracking telemetry.</li>
          </ul>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2 bg-blue-100 text-blue-800 rounded-lg w-fit">
            <FileCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            Legal Alignment & Standards
          </h4>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>Aligned with Zimbabwe Cyber and Data Protection Act [12:07].</li>
            <li>Default anonymous usage requires no sign-up or phone.</li>
            <li>Section 16 Right to Erasure honored cryptographically.</li>
            <li>All institutional names are fictionalized representative models.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

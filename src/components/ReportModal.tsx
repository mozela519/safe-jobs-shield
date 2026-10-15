import React, { useState } from 'react';
import { Language, ScamReport } from '../types';
import { translations } from '../i18n/translations';
import { computeHmacSha256, normalizeIdentifier } from '../crypto/privacy';
import {
  AlertTriangle,
  Lock,
  ShieldAlert,
  X,
  CheckCircle2,
  Info,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface ReportModalProps {
  language: Language;
  prefillIdentifier?: string;
  onClose: () => void;
  onSubmitReport: (report: ScamReport) => void;
  reportCountThisSession: number;
}

const SCAM_CATEGORIES = [
  { id: 'advance_fee', labelEn: 'Upfront Fee (Registration, Uniform, Medical, Badge)' },
  { id: 'trafficking_risk', labelEn: 'Trafficking Red Flag (Overseas Maid, Photo Request, Secrecy)' },
  { id: 'phishing_link', labelEn: 'Phishing Link / Lookalike Website Domain' },
  { id: 'identity_theft', labelEn: 'Banking Credential / OTP / National ID Theft' },
  { id: 'unrealistic_overseas', labelEn: 'Unrealistic Salary / Fake Foreign Work Visa' },
  { id: 'bribe_slot', labelEn: 'Secret Connection / City Council Slot Advance Fee' },
  { id: 'other', labelEn: 'Other Deceptive / Exploitative Practice' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  language,
  prefillIdentifier = '',
  onClose,
  onSubmitReport,
  reportCountThisSession,
}) => {
  const t = translations[language];
  const [identifierInput, setIdentifierInput] = useState(prefillIdentifier);
  const [selectedCategory, setSelectedCategory] = useState('advance_fee');
  const [region, setRegion] = useState('Harare');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [generatedHash, setGeneratedHash] = useState('');

  const isRateLimited = reportCountThisSession >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifierInput.trim() || isRateLimited) return;

    setIsSubmitting(true);
    try {
      const hash = await computeHmacSha256(identifierInput);
      setGeneratedHash(hash);

      const report: ScamReport = {
        id: 'rep-' + Date.now(),
        hashedIdentifier: hash,
        targetType: identifierInput.includes('@')
          ? 'email'
          : identifierInput.includes('.')
          ? 'domain'
          : 'phone',
        category: selectedCategory,
        timestamp: Date.now(),
      };

      onSubmitReport(report);
      setSubmittedSuccess(true);
    } catch (err) {
      console.error('Report submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-amber-600 text-white p-4 sm:p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-700 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                {t.reportModalTitle}
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                {t.reportModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-amber-700 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {submittedSuccess ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {t.reportSubmittedSuccess}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  The cryptographic HMAC-SHA256 hash was generated server-side with an isolated pepper and added to the defensive reputation pool:
                </p>
              </div>
              <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 break-all">
                {generatedHash}
              </div>
              <button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Rate Limit Alert */}
              {isRateLimited ? (
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 text-xs text-rose-900 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Rate Limit Enforced:</span> {t.rateLimitNotice}
                  </div>
                </div>
              ) : null}

              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recruiter Phone Number, Website URL, or Email:
                </label>
                <input
                  type="text"
                  required
                  disabled={isRateLimited}
                  placeholder="e.g. +263 77 123 4567 or suspicious-job-portal.xyz"
                  value={identifierInput}
                  onChange={(e) => setIdentifierInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white disabled:opacity-50"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Zero-Storage Rule: Only an irreversible server-side HMAC-SHA256 digest is stored with an isolated pepper. No cleartext numbers or message payloads are retained.
                </span>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.reportCategoryLabel}:
                </label>
                <select
                  disabled={isRateLimited}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                >
                  {SCAM_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Targeted Province / Location in Zimbabwe:
                </label>
                <select
                  disabled={isRateLimited}
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                >
                  <option value="Harare">Harare</option>
                  <option value="Bulawayo">Bulawayo</option>
                  <option value="Manicaland">Manicaland (Mutare / Nyanga)</option>
                  <option value="Mashonaland Central">Mashonaland Central (Bindura / Mazowe)</option>
                  <option value="Mashonaland East">Mashonaland East (Marondera)</option>
                  <option value="Mashonaland West">Mashonaland West (Chinhoyi)</option>
                  <option value="Masvingo">Masvingo</option>
                  <option value="Matabeleland North">Matabeleland North (Hwange / Lupane)</option>
                  <option value="Matabeleland South">Matabeleland South (Gwanda / Beitbridge)</option>
                  <option value="Midlands">Midlands (Gweru / Kwekwe)</option>
                  <option value="Diaspora / Cross-Border">Diaspora / Cross-Border</option>
                </select>
              </div>

              {/* Poisoning & Abuse Defense Warning Notice */}
              <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold">Poisoning Defense & Sybil Resistance:</span>{' '}
                  {t.poisoningWarningNotice} Single reports never trigger a HIGH RISK verdict on their own.
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!identifierInput.trim() || isRateLimited || isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm disabled:opacity-40 transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Hashing & Recording...' : t.reportSubmitButton}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

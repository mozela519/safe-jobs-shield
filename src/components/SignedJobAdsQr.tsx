import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Language, SessionCheckItem } from '../types';
import { translations } from '../i18n/translations';
import { verifyEmployerSignature, computeHmacSha256 } from '../crypto/privacy';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Lock,
  Building,
  Calendar,
  Briefcase,
  ExternalLink,
  Layers,
  Award,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';

interface SignedJobAdsQrProps {
  language: Language;
  onRecordCheck?: (check: SessionCheckItem) => void;
}

interface SignedJobAd {
  id: string;
  jobTitle: string;
  employerName: string;
  employerReg: string;
  sector: string;
  deadline: string;
  stipendTerms: string;
  officialApplyUrl: string;
  canonicalAdPayload: string;
  signatureHex: string;
}

const INITIAL_SIGNED_ADS: SignedJobAd[] = [
  {
    id: 'AD-001',
    jobTitle: 'Junior Frontend Developer (React & TypeScript)',
    employerName: 'Zambezi Digital Solutions',
    employerReg: 'ZIM-CO-2022-4412',
    sector: 'Information Technology',
    deadline: '2026-11-30',
    stipendTerms: 'Formal Junior Developer Salary + Medical Aid • Zero Recruitment Fees',
    officialApplyUrl: 'https://zambezidigital.co.zw/careers',
    canonicalAdPayload: 'AD-001|Junior Frontend Developer|Zambezi Digital Solutions|ZIM-CO-2022-4412|2026-11-30|Zero Recruitment Fees',
    signatureHex: '521bd989d721f32ad5077bd05fd4fe3500fc753554ae1dfbe40bb1a3424cad78',
  },
  {
    id: 'AD-002',
    jobTitle: 'Horticulture Graduate Apprentice',
    employerName: 'ZimFresh Agribusiness Ltd',
    employerReg: 'ZIM-CO-2023-8841',
    sector: 'Agribusiness & Export',
    deadline: '2026-12-15',
    stipendTerms: 'Statutory NEC Agricultural Wages + Transport Covered • Zero Recruitment Fees',
    officialApplyUrl: 'https://zimfresh-farms.co.zw',
    canonicalAdPayload: 'AD-002|Horticulture Graduate Apprentice|ZimFresh Agribusiness Ltd|ZIM-CO-2023-8841|2026-12-15|Zero Recruitment Fees',
    signatureHex: 'e4a54bb3f65ee82a4d4ba9abb7601c2fea6f6f736e90dcaf8f4258ab3e9f9bee',
  },
  {
    id: 'AD-003',
    jobTitle: 'Community Health Field Officer (12 Month Contract)',
    employerName: 'Batanai Community Health Trust',
    employerReg: 'ZIM-WO-2019-3012',
    sector: 'Public Health NGO',
    deadline: '2026-11-20',
    stipendTerms: 'NGO Graded Salary Scale + Field Allowance • Zero Recruitment Fees',
    officialApplyUrl: 'https://batanaihealth.org.zw',
    canonicalAdPayload: 'AD-003|Community Health Field Officer|Batanai Community Health Trust|ZIM-WO-2019-3012|2026-11-20|Zero Recruitment Fees',
    signatureHex: '1f1fcfb66d016bef3d3455b56fdb3bd5a9f3f7f33c61f5e8e10516581acd9d18',
  },
  {
    id: 'AD-004',
    jobTitle: 'Solar Installation Apprentice',
    employerName: 'Matabeleland Solar Tech',
    employerReg: 'ZIM-CO-2024-1109',
    sector: 'Renewable Energy',
    deadline: '2026-12-31',
    stipendTerms: 'NEC Engineering Apprenticeship Wages + Free Safety Kit • Zero Agency Fees',
    officialApplyUrl: 'https://matabeleland-solar.co.zw',
    canonicalAdPayload: 'AD-004|Solar Installation Apprentice|Matabeleland Solar Tech|ZIM-CO-2024-1109|2026-12-31|Zero Agency Fees',
    signatureHex: '9c4952430e45504dbc5463904dba8557f8f0de4aa91e07dfc1c33eb5f3c3250e',
  },
];

export const SignedJobAdsQr: React.FC<SignedJobAdsQrProps> = ({ language, onRecordCheck }) => {
  const [ads, setAds] = useState<SignedJobAd[]>(INITIAL_SIGNED_ADS);
  const [selectedAdId, setSelectedAdId] = useState<string>(INITIAL_SIGNED_ADS[0].id);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [tamperedAds, setTamperedAds] = useState<Record<string, boolean>>({});
  const [validationStatuses, setValidationStatuses] = useState<Record<string, boolean>>({});
  const [copiedCode, setCopiedCode] = useState(false);

  const activeAd = ads.find((a) => a.id === selectedAdId) || ads[0];

  // Verify signatures and generate QR code for active ad
  useEffect(() => {
    async function updateValidationAndQr() {
      const statuses: Record<string, boolean> = {};
      for (const ad of ads) {
        const isValid = await verifyEmployerSignature(ad.canonicalAdPayload, ad.signatureHex);
        statuses[ad.id] = isValid;
      }
      setValidationStatuses(statuses);

      // Record active ad check into session history
      const isValid = statuses[activeAd.id] ?? true;
      onRecordCheck?.({
        id: 'chk-qr-' + activeAd.id,
        type: 'signed_ad_qr',
        timestamp: Date.now(),
        title: `${activeAd.employerName} • ${activeAd.jobTitle}`,
        snippet: activeAd.stipendTerms,
        verdict: isValid ? 'VERIFIED_VALID' : 'VERIFIED_TAMPERED',
        riskScore: isValid ? 5 : 95,
        identifiers: [
          { type: 'employer', value: activeAd.employerName, label: 'Verified Zimbabwe Employer' },
          { type: 'domain', value: activeAd.officialApplyUrl, label: 'Official Portal' },
          { type: 'ad_id', value: `${activeAd.id} (${activeAd.employerReg})`, label: 'Company Reg Number' },
        ],
        metadata: {
          employerName: activeAd.employerName,
          jobTitle: activeAd.jobTitle,
          verificationSignatureHex: activeAd.signatureHex,
          isTampered: !isValid,
        },
      });

      // Generate QR Code containing verifiable URL & signature
      const verificationUrl = `https://safejobsshield.org/verify?ad=${activeAd.id}&sig=${activeAd.signatureHex.substring(0, 16)}&emp=${encodeURIComponent(activeAd.employerName)}`;
      try {
        const url = await QRCode.toDataURL(verificationUrl, {
          width: 260,
          margin: 1.5,
          color: {
            dark: '#064e3b',
            light: '#ffffff',
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate QR:', err);
      }
    }

    updateValidationAndQr();
  }, [ads, selectedAdId, activeAd]);

  const handleTamperAd = (adId: string) => {
    setAds((prev) =>
      prev.map((ad) => {
        if (ad.id === adId) {
          // Attacker injects a fake $25 fee into the signed ad
          return {
            ...ad,
            canonicalAdPayload: ad.canonicalAdPayload + '|TAMPERED_ADDED_25_USD_FEE',
            stipendTerms: 'TAMPERED: Now asks for $25 USD registration fee!',
          };
        }
        return ad;
      })
    );
    setTamperedAds((prev) => ({ ...prev, [adId]: true }));
  };

  const handleRestoreAd = (adId: string) => {
    const original = INITIAL_SIGNED_ADS.find((a) => a.id === adId);
    if (original) {
      setAds((prev) => prev.map((a) => (a.id === adId ? original : a)));
      setTamperedAds((prev) => {
        const next = { ...prev };
        delete next[adId];
        return next;
      });
    }
  };

  const isCurrentValid = validationStatuses[activeAd.id] ?? true;
  const isCurrentTampered = tamperedAds[activeAd.id];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                <QrCode className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
                Cryptographic Ad Authenticity • Anti-Spoofing
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Signed Job Ads with QR Verification & TrustPass
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-2xl leading-relaxed">
              Verifying an employer&apos;s name is not enough—scammers often copy legitimate company logos into fake ads. With Signed Job Ads, the <em>specific advertisement itself</em> is cryptographically signed. Anyone can scan the QR code to verify it hasn&apos;t been altered.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 shrink-0 text-center">
            <span className="text-xs font-bold text-emerald-300 block">
              ECDSA Signed Vacancy Notices
            </span>
            <span className="text-[11px] text-emerald-200/80 block mt-0.5">
              Cryptographic Anti-Tampering Standard
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Ad Selector & QR Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ad Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
            Choose an Authentic Job Advertisement:
          </span>

          <div className="space-y-2.5">
            {ads.map((ad) => {
              const isSelected = ad.id === selectedAdId;
              const isValid = validationStatuses[ad.id] ?? true;

              return (
                <button
                  key={ad.id}
                  type="button"
                  onClick={() => setSelectedAdId(ad.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950 text-white border-emerald-500 shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold leading-snug">{ad.jobTitle}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                        isValid
                          ? 'bg-emerald-800 text-emerald-200'
                          : 'bg-rose-900 text-rose-200 animate-pulse font-bold'
                      }`}
                    >
                      {isValid ? 'VALID' : 'TAMPERED'}
                    </span>
                  </div>
                  <span
                    className={`block text-[11px] mt-1 ${
                      isSelected ? 'text-emerald-300' : 'text-slate-500'
                    }`}
                  >
                    {ad.employerName} • {ad.employerReg}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tamper Simulator Button for Judges */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 mt-4">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Judge Tamper-Evidence Demonstration:</span>
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Click &quot;Test Tamper&quot; below to simulate an attacker altering this job ad (e.g. injecting a fake $25 fee). Watch the Web Crypto verification fail immediately!
            </p>

            <div className="pt-1">
              {isCurrentTampered ? (
                <button
                  type="button"
                  onClick={() => handleRestoreAd(activeAd.id)}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Original Untampered Ad</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleTamperAd(activeAd.id)}
                  className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Simulate Attacker Tampering with Ad</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Scannable QR & Verification Certificate (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
            {/* Ad Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                  Digitally Signed Vacancy
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 leading-snug">
                  {activeAd.jobTitle}
                </h3>
                <span className="text-xs text-slate-600 block mt-0.5">
                  Employer: <strong className="text-slate-900">{activeAd.employerName}</strong> ({activeAd.employerReg})
                </span>
              </div>

              {/* QR Code Container */}
              <div className="shrink-0 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 mx-auto sm:mx-0">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Verifiable Job Ad QR"
                    className="w-32 h-32 rounded object-contain shadow-2xs"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-slate-200 rounded text-xs text-slate-400">
                    Generating QR...
                  </div>
                )}
                <span className="block text-[10px] text-slate-500 font-mono mt-1">
                  Scan to Verify
                </span>
              </div>
            </div>

            {/* Validation Callout */}
            <div
              className={`p-3.5 rounded-xl border flex items-start justify-between gap-2.5 ${
                isCurrentValid
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950 animate-pulse'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {isCurrentValid ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                )}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {isCurrentValid
                      ? 'Web Crypto Digital Signature: Valid & Untampered'
                      : 'TAMPER DETECTED: Job Ad Contents Have Been Modified!'}
                  </h4>
                  <p className="text-[11px] mt-0.5 leading-relaxed text-slate-700">
                    {isCurrentValid
                      ? 'This advertisement is guaranteed authentic by the employer’s cryptographic signing key.'
                      : 'The text of this job advertisement does NOT match the signature. Scammer modified terms or added fees!'}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 shrink-0">
                {activeAd.id}
              </span>
            </div>

            {/* Terms & Application Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-500 block text-[11px] mb-0.5">
                  Remuneration & Safeguards:
                </span>
                <span className="font-medium text-slate-800 leading-snug block">
                  {activeAd.stipendTerms}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-500 block text-[11px] mb-0.5">
                  Application Deadline:
                </span>
                <span className="font-mono font-bold text-slate-800 block text-xs">
                  {activeAd.deadline}
                </span>
              </div>
            </div>

            {/* Cryptographic Signature Breakdown */}
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-[11px] font-mono space-y-1">
              <div className="flex justify-between items-center text-slate-700 font-bold">
                <span>Canonical Signed Payload:</span>
                <span className="text-[10px] font-normal text-slate-500">HMAC-SHA256 Web Crypto</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 text-slate-800 break-all text-[10px]">
                {activeAd.canonicalAdPayload}
              </div>
              <div className="text-[10px] text-slate-500 pt-1">
                Signature: {activeAd.signatureHex}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TrustPass 12-Month Plan Roadmap Callout */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-emerald-800 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">
            TrustPass Roadmap: 12-Month Vision for Zimbabwe HackLab 2026
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed max-w-3xl">
          Signed Job Ads are Step 1. In Step 2 (TrustPass), we reverse the flow: young job seekers receive digitally signed credentials from vocational colleges and certified employers, allowing them to apply safely to verified companies without surrendering raw identity documents to strangers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="font-bold text-emerald-300 block mb-1">Phase 1 (Months 1-3)</span>
            <span className="text-emerald-100">
              Signed Job Ads & QR Verification roll-out across 20 formal Zimbabwean corporate partners.
            </span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="font-bold text-emerald-300 block mb-1">Phase 2 (Months 4-8)</span>
            <span className="text-emerald-100">
              TrustPass pilot with Harare Polytechnic, NUST, and Chinhoyi University of Technology trainees.
            </span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="font-bold text-emerald-300 block mb-1">Phase 3 (Months 9-12)</span>
            <span className="text-emerald-100">
              National integration with Ministry of Youth and civil society anti-trafficking networks.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

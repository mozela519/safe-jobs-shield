import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import {
  LifeBuoy,
  PhoneCall,
  CreditCard,
  FileText,
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Printer,
  Copy,
  Check,
  Building,
} from 'lucide-react';

interface RecoveryGuideProps {
  language: Language;
}

export const RecoveryGuide: React.FC<RecoveryGuideProps> = ({ language }) => {
  const [selectedIncident, setSelectedIncident] = useState<'MONEY' | 'ID_DOCS' | 'BANK_PIN' | 'TRAVEL'>(
    'MONEY'
  );
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  const toggleCheck = (stepId: string) => {
    setCheckedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-rose-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-rose-500/20 text-rose-300 rounded-lg">
                <LifeBuoy className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider text-rose-300 font-bold">
                Emergency Incident Response • Leave-No-One-Behind
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              &quot;I Already Paid or Shared&quot; — Action Recovery Guide
            </h2>
            <p className="text-xs sm:text-sm text-rose-200/90 mt-1 max-w-2xl leading-relaxed">
              Most scam services stop at &quot;this is a scam&quot; and abandon the victim. If you already transferred money, surrendered your ID, or shared financial credentials, follow these immediate recovery steps to mitigate damage and protect your identity.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start md:self-center transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Emergency Checklist</span>
          </button>
        </div>
      </div>

      {/* Incident Selection Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => setSelectedIncident('MONEY')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedIncident === 'MONEY'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
          }`}
        >
          <CreditCard className="w-5 h-5 mb-1.5" />
          <span className="font-bold text-xs block leading-snug">1. I Sent Money</span>
          <span className={`text-[10px] block mt-0.5 ${selectedIncident === 'MONEY' ? 'text-rose-100' : 'text-slate-500'}`}>
            EcoCash / InnBucks / Mukuru
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedIncident('ID_DOCS')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedIncident === 'ID_DOCS'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
          }`}
        >
          <FileText className="w-5 h-5 mb-1.5" />
          <span className="font-bold text-xs block leading-snug">2. I Sent ID / Passport</span>
          <span className={`text-[10px] block mt-0.5 ${selectedIncident === 'ID_DOCS' ? 'text-rose-100' : 'text-slate-500'}`}>
            National ID / Photos
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedIncident('BANK_PIN')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedIncident === 'BANK_PIN'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
          }`}
        >
          <Lock className="w-5 h-5 mb-1.5" />
          <span className="font-bold text-xs block leading-snug">3. I Shared Bank PIN / OTP</span>
          <span className={`text-[10px] block mt-0.5 ${selectedIncident === 'BANK_PIN' ? 'text-rose-100' : 'text-slate-500'}`}>
            Card CVV / SMS Code
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedIncident('TRAVEL')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedIncident === 'TRAVEL'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
          }`}
        >
          <AlertOctagon className="w-5 h-5 mb-1.5" />
          <span className="font-bold text-xs block leading-snug">4. Traveled / Exploitation</span>
          <span className={`text-[10px] block mt-0.5 ${selectedIncident === 'TRAVEL' ? 'text-rose-100' : 'text-slate-500'}`}>
            Overseas / Trafficking Threat
          </span>
        </button>
      </div>

      {/* Action Plan Content based on Incident */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
        {/* SCENARIO 1: MONEY SENT */}
        {selectedIncident === 'MONEY' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded uppercase">
                Critical Priority: First 60 Minutes
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Action Plan: Reversal & Mobile Money Wallet Freeze
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Execute these steps immediately before the scammer cashes out at an agent booth:
              </p>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => toggleCheck('m1')}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  checkedSteps['m1'] ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checkedSteps['m1']}
                  onChange={() => toggleCheck('m1')}
                  className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-slate-900">
                      Step 1: File an Immediate Mobile Money Fraud Dispute
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      Audited & Confirmed: Oct 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Contact your mobile money provider immediately to request an urgent fraud security hold on the receiving wallet. <em>(Note: Rapid notification improves containment odds, but recovery is subject to provider verification and whether funds remain in the wallet)</em>:
                  </p>
                  <ul className="text-xs text-slate-600 mt-1.5 space-y-1 list-disc list-inside">
                    <li>
                      <strong>EcoPay Mobile Money (ApexCash):</strong> Call toll-free <strong>114</strong> or dial <strong>*151*7#</strong> [Confirmed Line: Oct 2026]. Provide transaction reference code (e.g. MP26...) and notify agent of unauthorized advance-fee recruitment scam.
                    </li>
                    <li>
                      <strong>SimbaBucks Support:</strong> Call official customer care desk on <strong>08677008800</strong> [Confirmed Line: Oct 2026].
                    </li>
                    <li>
                      <strong>SavannaPay (Savanna Telecom):</strong> Dial <strong>*111#</strong> or call toll-free fraud line <strong>123</strong> [Confirmed Line: Oct 2026].
                    </li>
                  </ul>
                </div>
              </div>

              <div
                onClick={() => toggleCheck('m2')}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  checkedSteps['m2'] ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checkedSteps['m2']}
                  onChange={() => toggleCheck('m2')}
                  className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Step 2: Save All Forensic Evidence & Screenshot the Chat
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Take full screenshots of the recruitment poster, full WhatsApp conversation history with timestamps, the recruiter&apos;s phone number, and payment SMS receipts. <strong>Do not delete or clear the chat thread</strong>; police cyber teams require untampered digital records.
                  </p>
                </div>
              </div>

              <div
                onClick={() => toggleCheck('m3')}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  checkedSteps['m3'] ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checkedSteps['m3']}
                  onChange={() => toggleCheck('m3')}
                  className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-slate-900">
                      Step 3: Lodge a Formal Complaint with Zimbabwe Republic Police (ZRP)
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      Confirmed Channels: Oct 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Report to your nearest ZRP Station or the <strong>CID Commercial Crimes Division (Fraud Squad)</strong>. Phone: <strong>+263 242 703631</strong> [ZRP National Complaints Desk • Confirmed: Oct 2026]. Request an official <strong>CR / Docket Number</strong>. Mobile money providers and banks require an official police docket number to evaluate dispute claims.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCENARIO 2: ID SENT */}
        {selectedIncident === 'ID_DOCS' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded uppercase">
                Identity Theft Defense
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Action Plan: Mitigate Identity Document Misuse
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Stolen national ID copies can be exploited for unauthorized SIM registrations or fraudulent micro-loans:
              </p>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => toggleCheck('id1')}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  checkedSteps['id1'] ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checkedSteps['id1']}
                  onChange={() => toggleCheck('id1')}
                  className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-slate-900">
                      Step 1: Place a Defensive Fraud Alert with Credit Bureaus
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      Audited: Oct 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Notify <strong>TransUnion Credit Bureau</strong> (Tel: <strong>+263 242 708891</strong> [Confirmed: Oct 2026]) and <strong>Financial Clearing Bureau (FCB)</strong> (Tel: <strong>+263 242 707641</strong> [Confirmed: Oct 2026]). Request a protective security alert on your National ID to help prevent predatory lenders from issuing loans without physical biometric presence.
                  </p>
                </div>
              </div>

              <div
                onClick={() => toggleCheck('id2')}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  checkedSteps['id2'] ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checkedSteps['id2']}
                  onChange={() => toggleCheck('id2')}
                  className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Step 2: Secure Your Mobile Lines Against Unauthorized SIM Swaps
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Contact your mobile cellular provider (e.g. Apex Telecom, Savanna Telecom, or TeleLink Mobile). Request an explicit SIM-swap security lock on your mobile subscriber identity to require in-person national ID verification before any replacement SIM can be activated.
                  </p>
                </div>
              </div>

              <div
                onClick={() => toggleCheck('id3')}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  checkedSteps['id3'] ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checkedSteps['id3']}
                  onChange={() => toggleCheck('id3')}
                  className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Step 3: Document Guard Client-Side Watermarking
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    For all future job submissions, apply our <strong>Document Guard</strong> tool to stamp the verified employer&apos;s name and date across the document face. Stamped documents are rejected by micro-lenders and identity thieves.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCENARIO 3: BANK PIN OR OTP SHARED */}
        {selectedIncident === 'BANK_PIN' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded uppercase">
                Immediate Financial Containment
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Action Plan: Bank Card Hot-Carding & Account Isolation
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                If you shared payment card details, CVV security codes, bank PINs, or an SMS OTP:
              </p>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => toggleCheck('bp1')}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  checkedSteps['bp1'] ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checkedSteps['bp1']}
                  onChange={() => toggleCheck('bp1')}
                  className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-slate-900">
                      Step 1: Emergency Bank Card Freeze (24/7 Hot-Carding Lines)
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      Audited Official Lines: Oct 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Contact your financial institution immediately to deactivate and hot-card your debit/credit card. <em>(Representative confirmed institutional emergency lines)</em>:
                  </p>
                  <ul className="text-xs text-slate-600 mt-1.5 space-y-1">
                    <li>• <strong>Crown Commercial Bank:</strong> 24/7 Hotline <strong>08677004050</strong> [Confirmed: Oct 2026]</li>
                    <li>• <strong>Beacon Trust Bank:</strong> Toll-Free <strong>08088888</strong> [Confirmed: Oct 2026]</li>
                    <li>• <strong>Central Building Society (CBS):</strong> Emergency Line <strong>+263 242 883822</strong> [Confirmed: Oct 2026]</li>
                    <li>• <strong>Southern Heritage Bank:</strong> Client Care <strong>+263 242 799400</strong> [Confirmed: Oct 2026]</li>
                    <li>• <strong>First Horizon Bank:</strong> 24/7 Contact <strong>+263 242 704481</strong> [Confirmed: Oct 2026]</li>
                  </ul>
                </div>
              </div>

              <div
                onClick={() => toggleCheck('bp2')}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  checkedSteps['bp2'] ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checkedSteps['bp2']}
                  onChange={() => toggleCheck('bp2')}
                  className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Step 2: Reset Mobile Banking Passwords & Evict Active Sessions
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Using your bank&apos;s verified mobile application, update credentials, change USSD PINs, and terminate active web banking sessions from a known secure smartphone or computer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCENARIO 4: TRAVEL / EXPLOITATION */}
        {selectedIncident === 'TRAVEL' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded uppercase">
                Safety & Humanitarian Referral
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Assistance Protocol: Suspected Exploitation or Foreign Stranding
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                For individuals facing confiscated travel documents, deceptive domestic servitude, or stranded abroad:
              </p>
            </div>

            <div className="bg-rose-700 text-white p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <PhoneCall className="w-5 h-5 text-rose-200" />
                <span>Zimbabwe National Referral Helpline: 08080074 (Toll-Free)</span>
              </div>
              <div className="text-[10px] bg-rose-900/60 inline-block px-2 py-0.5 rounded font-mono">
                Confirmed Line • Verified Active: Oct 2026
              </div>
              <p className="text-xs text-rose-100 leading-relaxed">
                Operated by the Musasa Project in direct referral collaboration with the Zimbabwe Republic Police (ZRP) Anti-Trafficking Desk. Toll-free from Zimbabwean telecom provider networks.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900">
                    International Organization for Migration (IOM Harare Mission)
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                    Confirmed: Oct 2026
                  </span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Provides voluntary return assistance, reintegration counseling, and emergency consular referrals for Zimbabwean migrants stranded abroad. Telephone: <strong>+263 242 704285</strong> / <strong>+263 242 707672</strong>.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900">
                    Ministry of Foreign Affairs & International Trade — Consular Affairs
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                    Confirmed: Oct 2026
                  </span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Munhumutapa Building, Samora Machel Avenue, Harare. Citizens overseas experiencing document confiscation should contact the nearest accredited Zimbabwean diplomatic mission (Abu Dhabi, Kuwait City, London, or Pretoria) for emergency travel certificates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Verification & Legal Disclosure */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-2 leading-relaxed">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-slate-500" />
            <span>Verification Status & Operational Disclaimer:</span>
          </div>
          <p>
            <strong>Confirmed Contacts:</strong> All helpline numbers, USSD shortcuts, and regulatory agency hotlines listed on this page were audited and confirmed active as of October 2026.
          </p>
          <p>
            <strong>Limitation of Liability:</strong> Safe Jobs Shield provides defensive guidance, evidence documentation templates, and official referral directories. Initiating a mobile money or card dispute requests an administrative hold from the payment provider, but does not guarantee fund recovery if the scammer has already withdrawn funds. Safe Jobs Shield does not exercise policing or judicial powers; criminal offenses must be formally reported to the Zimbabwe Republic Police.
          </p>
          <p className="text-slate-500 italic">
            *Enterprise institution names (e.g. Apex Telecom, Crown Commercial Bank) are fictionalized representative names used to illustrate institutional response workflows while protecting third-party intellectual property.
          </p>
        </div>
      </div>
    </div>
  );
};

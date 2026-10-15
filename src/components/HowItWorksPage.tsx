import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import {
  Shield,
  FileSearch,
  Lock,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Database,
  Smartphone,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

interface HowItWorksPageProps {
  language: Language;
  onOpenChat: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ language, onOpenChat }) => {
  const t = translations[language];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-emerald-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
            <Shield className="w-5 h-5" />
          </span>
          <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
            Defensive Architecture Overview
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          How Safe Jobs Shield Protects Job Seekers
        </h2>
        <p className="text-xs sm:text-sm text-emerald-200 mt-2 max-w-2xl leading-relaxed">
          From the moment a youth forwards an offer over WhatsApp or USSD, our pipeline evaluates fraud indicators, verifies digital signatures, and safeguards privacy in under 1.5 seconds.
        </p>
      </div>

      {/* 4-Step Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Step 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center mb-3">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">Forward Offer</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              User forwards a job message, link, email, or recruiter phone number via WhatsApp, Web, or USSD (*707#).
            </p>
          </div>
          <span className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
            Accepts text, voice note, URL
          </span>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center mb-3">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">Server-Side HMAC Hash</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Phone numbers and domains are converted to irreversible digests via server-side HMAC-SHA256 with an isolated environment pepper.
            </p>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-3 pt-2 border-t border-slate-100">
            Zero cleartext stored on server
          </span>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center mb-3">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">Rules & Cryptography</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Rules engine checks advance fees, fake domains, and exploitation risks while server HMAC verifies official employer registry signatures.
            </p>
          </div>
          <span className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
            Weighted heuristics & trust scores
          </span>
        </div>

        {/* Step 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center mb-3">
              4
            </div>
            <h3 className="text-sm font-bold text-slate-900">Empowering Action</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              The user receives a plain-language verdict (LOW RISK, SUSPICIOUS, HIGH RISK) with next steps or verified employer pathways.
            </p>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-3 pt-2 border-t border-slate-100">
            In English, ChiShona or isiNdebele
          </span>
        </div>
      </div>

      {/* Anonymous Default Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <strong className="block font-bold">100% Anonymous by Default:</strong>
          <span className="text-[11px] text-emerald-800">No account, phone number, or sign-up is required to check job offers or verify recruiters. Optional citizen accounts hold zero message content.</span>
        </div>
        <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2.5 py-1 rounded-full shrink-0">
          No Tracking Cookies
        </span>
      </div>

      {/* Defensive Ethics & Non-Accusation Policy */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          <span>Defensive Ethics & Non-Accusation Principles</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          In strict compliance with defensive engineering ethics, Safe Jobs Shield never outputs hard legal accusations against named individuals. Rather, we provide objective diagnostic risk indicators (e.g. &quot;This offer demands an advance uniform fee before training; legitimate employers do not charge fees&quot;).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-rose-800 block mb-1">HIGH RISK</span>
            <span className="text-slate-600">
              Clear fraud indicators (advance fee, OTP theft, photo demands). Immediate block and report advice.
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-amber-800 block mb-1">SUSPICIOUS</span>
            <span className="text-slate-600">
              Unusual signals (free email, urgency pressure). Youth are guided to ask for physical venue and registry number.
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-emerald-800 block mb-1">LOW RISK</span>
            <span className="text-slate-600">
              Verified corporate or NGO domain, zero-fee commitment, multi-stage physical interviews.
            </span>
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={onOpenChat}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer transition-all"
        >
          <span>Try the WhatsApp Chat Simulator Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import {
  Users,
  Smartphone,
  Mic,
  Eye,
  HeartHandshake,
  DollarSign,
  Shield,
  PhoneCall,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';

interface InclusionPageProps {
  language: Language;
}

export const InclusionPage: React.FC<InclusionPageProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-emerald-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Award className="w-5 h-5" />
          </span>
          <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
            National Youth Employment Safeguards • Economic Protection & Decent Work
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Youth Economic Empowerment & Radical Inclusion
        </h2>
        <p className="text-xs sm:text-sm text-emerald-200 mt-2 max-w-3xl leading-relaxed">
          In Zimbabwe, predatory recruitment syndicates exploit the vulnerability of unemployed youth (ages 18-35). Safe Jobs Shield provides both a defensive SHIELD to detect deception and a verified PATHWAY to authentic livelihoods.
        </p>
      </div>

      {/* 4 Pillars of Inclusion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pillar 1: Feature Phones (USSD & SMS) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              1. 2G Feature Phones & USSD (*707#)
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Over 68% of rural Zimbabwean youth outside Harare and Bulawayo use basic 2G feature phones (&quot;kambudzi&quot;). They cannot afford mobile data bundles ($2/GB) or smartphones.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 my-3 text-xs space-y-1">
              <span className="font-bold text-slate-800 block text-[11px]">USSD Menu Architecture (*707#):</span>
              <p className="font-mono text-[11px] text-emerald-800 bg-white p-2 rounded border border-slate-200">
                1. Check Recruiter Phone<br />
                2. Report Upfront Fee Demand<br />
                3. Browse Verified Agribusiness / Mining Jobs<br />
                4. Trafficking Emergency Helpline
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Zero mobile data required on Econet & NetOne networks</span>
          </span>
        </div>

        {/* Pillar 2: Low Literacy & Audio Accessibility */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              2. Low Literacy & Voice-First Pipeline
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Job seekers with lower formal literacy or English fluency struggle with lengthy legal disclaimers. We provide voice notes and plain-language vernacular audio.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 my-3 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 block text-[11px]">Voice Integration Plan:</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Users forward WhatsApp audio notes directly to the bot. Browser Speech API / Whisper STT parses speech into text, runs defensive rules, and responds with short, natural ChiShona or isiNdebele audio voice verdicts.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-purple-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Voice note forwarding supported on standard WhatsApp</span>
          </span>
        </div>

        {/* Pillar 3: Gender & Trafficking Safeguards */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-3">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              3. Gender Safeguards & Trafficking Alerts
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Young women face heightened risks of predatory &quot;maids in Kuwait/Dubai&quot; schemes, forced domestic servitude, and fake hospitality grooming that demands full-body photos and secret travel bookings.
            </p>
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 my-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-rose-900 font-bold text-[11px]">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Zimbabwe National Helpline Integration:</span>
              </div>
              <p className="text-rose-800 text-[11px] leading-relaxed">
                Direct referral helpline link to Musasa Project & CID Anti-Human Trafficking Unit (<strong>08080074</strong> [Confirmed Toll-Free: Oct 2026]). Instant safety guidance trigger when physical measurements, secret travel tickets, or private visas are requested.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Automatic safety trigger on domestic worker red flags</span>
          </span>
        </div>

        {/* Pillar 4: Deaf & Hard-of-Hearing Relays */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              4. Deaf & Hearing-Impaired Accessibility
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Deaf job seekers are frequently targeted through unverified WhatsApp text groups without accessible relay support to verify recruitment legitimacy.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 my-3 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 block text-[11px]">Accessibility Standards:</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Color-coded high-contrast badges (Green/Yellow/Red), full screen-reader ARIA labeling, text-only ultra-low data mode, and visual step-by-step action cards.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>High contrast & Text-only toggle available in top bar</span>
          </span>
        </div>
      </div>

      {/* Real Budget Feasibility Table (Under $5,000 USD) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            Real Deployment Budget Model (~USD 5,000 Total)
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          Designed for maximum frugality using open-source tools, free-tier cloud infrastructure, and existing NGO partnerships:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Component</th>
                <th className="p-2.5">Tool / Provider</th>
                <th className="p-2.5">Cost Model</th>
                <th className="p-2.5 text-right">Annual Budget (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="p-2.5 font-medium text-slate-900">Cloud Compute & API</td>
                <td className="p-2.5">FastAPI on Cloud Run / Fly.io</td>
                <td className="p-2.5">Scale-to-zero serverless container</td>
                <td className="p-2.5 text-right font-mono font-bold">$360</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-slate-900">Database & Reputation State</td>
                <td className="p-2.5">PostgreSQL (Cloud SQL / Supabase)</td>
                <td className="p-2.5">Free-tier / Developer scale (HMAC hashes only)</td>
                <td className="p-2.5 text-right font-mono font-bold">$240</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-slate-900">WhatsApp Messaging Bandwidth</td>
                <td className="p-2.5">Meta WhatsApp Cloud API</td>
                <td className="p-2.5">1,000 free service conversations/mo + $0.005/msg</td>
                <td className="p-2.5 text-right font-mono font-bold">$1,200</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-slate-900">USSD Gateway (*707#)</td>
                <td className="p-2.5">Econet / NetOne Vas Gateway / Africa&apos;s Talking</td>
                <td className="p-2.5">Aggregator fee subsidized under Youth HackLab grant</td>
                <td className="p-2.5 text-right font-mono font-bold">$1,800</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-slate-900">Community Outreach & Translation</td>
                <td className="p-2.5">Youth peer ambassadors & local radio</td>
                <td className="p-2.5">Volunteer stipends in 5 provinces</td>
                <td className="p-2.5 text-right font-mono font-bold">$1,400</td>
              </tr>
              <tr className="bg-emerald-50/80 font-bold text-slate-900">
                <td className="p-2.5" colSpan={3}>Total Estimated First-Year Budget</td>
                <td className="p-2.5 text-right font-mono text-emerald-800 text-sm">$5,000 USD</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

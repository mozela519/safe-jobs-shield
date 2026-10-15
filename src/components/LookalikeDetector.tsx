import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import {
  Globe,
  AlertTriangle,
  Search,
  Building,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  Copy,
  Check,
} from 'lucide-react';

interface LookalikeDetectorProps {
  language: Language;
}

interface CuratedEntity {
  id: string;
  name: string;
  category: 'Telecom' | 'Beverages / Manufacturing' | 'Retail' | 'Public Sector' | 'International / NGO' | 'Financial';
  officialDomain: string;
  officialEmailFormat: string;
  headquarters: string;
  commonSpoofPatterns: string[];
  vulnerabilityNote: string;
}

const CURATED_ZIM_ENTITIES: CuratedEntity[] = [
  {
    id: 'zim-001',
    name: 'EcoTel Communications Zimbabwe (Fictional Model)',
    category: 'Telecom',
    officialDomain: 'ecotel.co.zw',
    officialEmailFormat: 'careers@ecotel.co.zw / info@ecotel.co.zw',
    headquarters: 'EcoTel Park, Msasa Commercial Zone, Harare',
    commonSpoofPatterns: ['ecotel-careers-portal.xyz', 'ecotel-graduate-2026.top', 'ecotel-trainee.online', 'ecotel-airtime-jobs.site'],
    vulnerabilityNote: 'Frequently modeled for high-paying graduate trainee and customer service intake scams using .xyz lookalikes.',
  },
  {
    id: 'zim-002',
    name: 'Zambezi Breweries & Bottling Ltd (Fictional Model)',
    category: 'Beverages / Manufacturing',
    officialDomain: 'zambezibottlers.co.zw',
    officialEmailFormat: 'careers@zambezibottlers.co.zw / hr@zambezibottlers.co.zw',
    headquarters: 'Sable Industrial Park, Borrowdale, Harare',
    commonSpoofPatterns: ['zambezibottling.recruitment2026@gmail.com', 'zambezi-jobs-zim.xyz', 'zambezibrewery-intake.top'],
    vulnerabilityNote: 'Target of general worker and packaging shift scams demanding upfront safety shoe or medical fees.',
  },
  {
    id: 'zim-003',
    name: 'Apex Supermarkets Zimbabwe (Fictional Model)',
    category: 'Retail',
    officialDomain: 'apexretail.co.zw',
    officialEmailFormat: 'recruitment@apexretail.co.zw',
    headquarters: 'Travel Centre Building, Jason Moyo Avenue, Harare',
    commonSpoofPatterns: ['apexretail-recruitment.top', 'apex-supermarkets-jobs.site', 'apex-distribution.xyz'],
    vulnerabilityNote: 'Supermarket till operator and shelf-packer scams demanding mobile money uniform payments.',
  },
  {
    id: 'zim-004',
    name: 'MetroMart Supermarkets (Fictional Model)',
    category: 'Retail',
    officialDomain: 'metromart.co.zw',
    officialEmailFormat: 'careers@metromart.co.zw',
    headquarters: 'Kelvin Road North, Graniteside Industrial, Harare',
    commonSpoofPatterns: ['metromart-intake.work', 'metromart-packers.online', 'metromart.hr.recruitment@gmail.com'],
    vulnerabilityNote: 'Circulates as viral WhatsApp status flyers advertising non-existent cashier shifts.',
  },
  {
    id: 'zim-005',
    name: 'Greater Metropolitan Council (Fictional Model)',
    category: 'Public Sector',
    officialDomain: 'metrocouncil.gov.zw',
    officialEmailFormat: 'clerk@metrocouncil.gov.zw / hr@metrocouncil.gov.zw',
    headquarters: 'Civic Centre, Julius Nyerere Way, Harare CBD',
    commonSpoofPatterns: ['metrocouncil-vacancies.work', 'metrocouncil-clerk.site', 'civiccentre.intake@gmail.com'],
    vulnerabilityNote: 'Targeted by corrupt middlemen claiming "secret insider slots" for council administration clerks.',
  },
  {
    id: 'zim-006',
    name: 'International Relief & Aid Mission - IRAM (Fictional Model)',
    category: 'International / NGO',
    officialDomain: 'iram-aid.org.zw',
    officialEmailFormat: 'iram-aid.org.zw / iram.org addresses only',
    headquarters: 'Arundel Office Park, Mount Pleasant, Harare',
    commonSpoofPatterns: ['iram.recruitment.harare@yahoo.com', 'iram-zim-relief.site', 'iram-humanitarian-jobs.online'],
    vulnerabilityNote: 'High salary USD bait claiming aid distribution clerk roles; demands bank card photos and OTPs.',
  },
  {
    id: 'zim-007',
    name: 'National Youth Empowerment Directorate (Fictional Model)',
    category: 'Public Sector',
    officialDomain: 'youthempowerment.gov.zw',
    officialEmailFormat: 'info@youthempowerment.gov.zw / gov.zw addresses only',
    headquarters: 'Corner Herbert Chitepo & 4th Street, Harare',
    commonSpoofPatterns: ['zim-youth-careers.xyz', 'youth-empowerment-grant.top', 'youth-fund-intake.work'],
    vulnerabilityNote: 'Exploits youth grants and apprentice programs to harvest national ID numbers.',
  },
  {
    id: 'zim-008',
    name: 'National Tax & Customs Authority (Fictional Model)',
    category: 'Public Sector',
    officialDomain: 'nat-tax.co.zw',
    officialEmailFormat: 'careers@nat-tax.co.zw / hr@nat-tax.co.zw',
    headquarters: 'First Street & Kwame Nkrumah Avenue, Harare',
    commonSpoofPatterns: ['nattax-trainee.top', 'nattax-customs-intake.site', 'tax-recruitment-agent@gmail.com'],
    vulnerabilityNote: 'Border post customs revenue trainee scams demanding interview badge fees.',
  },
  {
    id: 'zim-009',
    name: 'Highland Mutual Assurance Ltd (Fictional Model)',
    category: 'Financial',
    officialDomain: 'highlandmutual.co.zw',
    officialEmailFormat: 'vacancies@highlandmutual.co.zw',
    headquarters: 'The Chase West, Emerald Hill, Harare',
    commonSpoofPatterns: ['highlandmutual-internships.top', 'highland-fin-jobs.online', 'highlandmutual.careers@gmail.com'],
    vulnerabilityNote: 'Impersonated for financial advisory and insurance trainee scams.',
  },
];

export const LookalikeDetector: React.FC<LookalikeDetectorProps> = ({ language }) => {
  const [testInput, setTestInput] = useState('http://ecotel-careers-portal.xyz/apply-now');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleAnalyzeInput = (inputToCheck?: string) => {
    const raw = (inputToCheck || testInput).trim().toLowerCase();
    if (!raw) return;

    // Check against curated Zimbabwean brands
    let matchedBrand: CuratedEntity | null = null;
    let isImpersonation = false;
    let reasons: string[] = [];

    for (const entity of CURATED_ZIM_ENTITIES) {
      const brandKey = entity.name.toLowerCase().split(' ')[0]; // econet, delta, ok, tm, city, united, ministry, zimra, old
      const officialDom = entity.officialDomain.toLowerCase();

      // Check if input mentions brand name
      if (raw.includes(brandKey) || raw.includes(entity.officialDomain)) {
        matchedBrand = entity;

        // Check if domain is NOT the official domain
        if (!raw.includes(officialDom)) {
          isImpersonation = true;
          if (raw.includes('@gmail.com') || raw.includes('@yahoo.com') || raw.includes('@outlook.com')) {
            reasons.push(`Free email provider used instead of official corporate domain @${officialDom}.`);
          }
          if (raw.includes('.xyz') || raw.includes('.top') || raw.includes('.buzz') || raw.includes('.work') || raw.includes('.site')) {
            reasons.push(`Suspicious top-level domain (.xyz/.top/.work) commonly used in disposable phishing campaigns.`);
          }
          if (raw.includes('http://') && !raw.includes('https://')) {
            reasons.push('Insecure unencrypted HTTP connection.');
          }
          if (reasons.length === 0) {
            reasons.push(`Domain does not match the official second-level domain (${officialDom}).`);
          }
        }
        break;
      }
    }

    if (!matchedBrand) {
      // Generic lookalike heuristic
      const hasBadTld = raw.includes('.xyz') || raw.includes('.top') || raw.includes('.site') || raw.includes('.work');
      const hasFreeEmail = raw.includes('@gmail.com') || raw.includes('@yahoo.com');

      setAnalysisResult({
        status: hasBadTld || hasFreeEmail ? 'SUSPICIOUS_GENERIC' : 'UNLISTED',
        input: raw,
        matchedBrand: null,
        reasons: hasBadTld ? ['High-abuse top-level domain detected.'] : hasFreeEmail ? ['Free email used for supposed employer.'] : ['No recognized Zimbabwean corporate brand spoofing detected.'],
      });
      return;
    }

    setAnalysisResult({
      status: isImpersonation ? 'IMPERSONATION_DETECTED' : 'OFFICIAL_MATCH',
      input: raw,
      matchedBrand,
      reasons,
    });
  };

  React.useEffect(() => {
    handleAnalyzeInput();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredEntities = CURATED_ZIM_ENTITIES.filter(
    (e) =>
      e.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      e.officialDomain.toLowerCase().includes(searchFilter.toLowerCase()) ||
      e.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                <Globe className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
                Brand Impersonation & Typosquatting Defense
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Lookalike Impersonation Detector
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-2xl leading-relaxed">
              Scammers frequently clone corporate brands (such as telecommunications operators, beverage bottlers, and supermarket chains) to trick job seekers into paying fees. Cross-check any URL or email against our curated directory of verified domain patterns.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center shrink-0">
            <span className="text-xs font-bold text-emerald-300 block">
              Curated Entity Models
            </span>
            <span className="text-[11px] text-emerald-200/80 block mt-0.5">
              Fictional Zimbabwean Targets
            </span>
          </div>
        </div>

        {/* Fictional Model Educational Notice */}
        <div className="mt-4 pt-3 border-t border-emerald-700/60 text-[11px] text-emerald-200/80 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong>Educational Specification:</strong> All entity names shown are fictional illustrative models created for cybersecurity training and scam-spoof pattern demonstration.
          </span>
        </div>
      </div>

      {/* Interactive Lookalike Checker Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-emerald-600" />
            <span>Interactive URL, Domain & Recruiter Email Verifier</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Paste any recruitment link or email to detect lookalike spoofs:
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="e.g. http://econet-careers-portal.xyz/apply or deltabeverages.hr@gmail.com"
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
          />
          <button
            type="button"
            onClick={() => handleAnalyzeInput()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm cursor-pointer transition-colors shrink-0"
          >
            Check Impersonation
          </button>
        </div>

        {/* Quick Test Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-500 font-semibold">Test Presets:</span>
          <button
            type="button"
            onClick={() => {
              setTestInput('http://econet-careers-portal.xyz/apply-now');
              handleAnalyzeInput('http://econet-careers-portal.xyz/apply-now');
            }}
            className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer font-mono"
          >
            econet-careers-portal.xyz [Fake]
          </button>
          <button
            type="button"
            onClick={() => {
              setTestInput('deltabeverages.recruitment2026@gmail.com');
              handleAnalyzeInput('deltabeverages.recruitment2026@gmail.com');
            }}
            className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer font-mono"
          >
            delta.recruitment@gmail [Fake]
          </button>
          <button
            type="button"
            onClick={() => {
              setTestInput('https://econet.co.zw/careers');
              handleAnalyzeInput('https://econet.co.zw/careers');
            }}
            className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded cursor-pointer font-mono border border-emerald-200"
          >
            econet.co.zw/careers [Official]
          </button>
        </div>

        {/* Diagnostic Verdict Result Callout */}
        {analysisResult && (
          <div
            className={`p-4 rounded-xl border mt-3 transition-all ${
              analysisResult.status === 'IMPERSONATION_DETECTED'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : analysisResult.status === 'OFFICIAL_MATCH'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {analysisResult.status === 'IMPERSONATION_DETECTED' ? (
                  <ShieldAlert className="w-6 h-6 text-rose-600" />
                ) : analysisResult.status === 'OFFICIAL_MATCH' ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      analysisResult.status === 'IMPERSONATION_DETECTED'
                        ? 'bg-rose-600 text-white'
                        : analysisResult.status === 'OFFICIAL_MATCH'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {analysisResult.status === 'IMPERSONATION_DETECTED'
                      ? 'CRITICAL IMPERSONATION DETECTED'
                      : analysisResult.status === 'OFFICIAL_MATCH'
                      ? 'VERIFIED OFFICIAL BRAND DOMAIN'
                      : 'CAUTION: UNLISTED ENTITY'}
                  </span>
                  {analysisResult.matchedBrand && (
                    <span className="text-xs font-bold text-slate-800">
                      Target: {analysisResult.matchedBrand.name}
                    </span>
                  )}
                </div>

                {analysisResult.status === 'IMPERSONATION_DETECTED' && analysisResult.matchedBrand && (
                  <div className="text-xs space-y-1 mt-1">
                    <p className="font-semibold text-rose-900 leading-relaxed">
                      This link or email is an imitation! The legitimate official domain for{' '}
                      <strong>{analysisResult.matchedBrand.name}</strong> is{' '}
                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-rose-300 font-bold text-emerald-800">
                        {analysisResult.matchedBrand.officialDomain}
                      </span>.
                    </p>
                    <ul className="list-disc list-inside text-rose-800 space-y-0.5 pt-1 text-[11px]">
                      {analysisResult.reasons.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.status === 'OFFICIAL_MATCH' && analysisResult.matchedBrand && (
                  <p className="text-xs text-emerald-900">
                    Matches the authentic registered corporate domain for {analysisResult.matchedBrand.name} (
                    <strong className="font-mono">{analysisResult.matchedBrand.officialDomain}</strong>).
                  </p>
                )}

                {analysisResult.status === 'SUSPICIOUS_GENERIC' && (
                  <p className="text-xs text-amber-900">
                    Not a known major Zimbabwean corporate brand, but exhibits high-risk indicators (unusual TLD or free email).
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Curated Zimbabwean Brand & Public Entity Registry Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Curated Zimbabwean Official Entity Registry
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified corporate domains and known impersonation tactics:
            </p>
          </div>
          <input
            type="text"
            placeholder="Filter entities..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-56"
          />
        </div>

        <div className="space-y-3">
          {filteredEntities.map((ent) => (
            <div
              key={ent.id}
              className="bg-slate-50 rounded-xl p-4 border border-slate-200/90 space-y-2.5 hover:border-emerald-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-900">{ent.name}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                    {ent.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-500">Official:</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    https://{ent.officialDomain}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                <div>
                  <span className="font-semibold text-slate-700 block text-[11px]">Authorized Contact / HQ:</span>
                  <span className="text-slate-800 font-mono text-[11px] block">{ent.officialEmailFormat}</span>
                  <span className="text-[11px] text-slate-500 block truncate">{ent.headquarters}</span>
                </div>

                <div>
                  <span className="font-semibold text-rose-700 block text-[11px]">Documented Fake Spoofs to Avoid:</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {ent.commonSpoofPatterns.map((spoof, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono bg-rose-50 text-rose-800 px-1.5 py-0.2 rounded border border-rose-200"
                      >
                        {spoof}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/70">
                {ent.vulnerabilityNote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

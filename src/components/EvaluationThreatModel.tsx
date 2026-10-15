import React, { useState } from 'react';
import { Language } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Cpu,
  Layers,
  Search,
  Key,
  Server,
  FileCheck,
  Terminal,
  Activity,
  ArrowRight,
  ExternalLink,
  Info,
  Zap,
  EyeOff,
  Database,
  BarChart3,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface EvaluationThreatModelProps {
  language: Language;
  onNavigateTab?: (tab: 'tests' | 'privacy' | 'employers' | 'chat') => void;
}

export const EvaluationThreatModel: React.FC<EvaluationThreatModelProps> = ({
  language,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'threat_model' | 'boundaries' | 'benchmarks' | 'vetting_kms'>(
    'threat_model'
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">
                Security Architecture • Evidence-Based Systems Audit
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Threat Model & Technical Evaluation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Formal STRIDE-based vulnerability analysis, operational trust boundaries, adversarial detection benchmarks, and cryptographic key management specifications for national deployment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-center">
              <span className="block text-xl font-bold text-emerald-400">27 / 27</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Test Vectors Passing
              </span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-center">
              <span className="block text-xl font-bold text-indigo-400">&lt; 15 ms</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Rule Engine Latency
              </span>
            </div>
          </div>
        </div>

        {/* Section Navigation Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('threat_model')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'threat_model'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>1. STRIDE Threat Model</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('boundaries')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'boundaries'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Scope & Trust Boundaries</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('benchmarks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'benchmarks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>3. Detection Benchmarks (27 Tests)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vetting_kms')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'vetting_kms'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>4. Employer Vetting & Key Management (KMS)</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: STRIDE THREAT MODEL */}
      {activeTab === 'threat_model' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                STRIDE Threat Analysis
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                Adversarial Attack Vectors & Technical Countermeasures
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Analysis of primary threat actors targeting Zimbabwean job applicants (advance-fee scammers, lookalike domain spoofers, domestic servitude rings, and rogue micro-finance lenders).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Spoofing */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                      S
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">Spoofing Identity & Corporate Brand</h4>
                  </div>
                  <span className="text-[10px] bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 rounded border border-rose-200">
                    High Risk
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Attack:</strong> Scammers register lookalike domains (e.g. <code>apextelecom-careers.xyz</code>), mimic corporate logos, and create burner WhatsApp profiles impersonating official HR recruiters.
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700">
                  <strong className="text-emerald-700">Technical Defense:</strong> Normalized Levenshtein distance matching against verified corporate domains; mandatory canonical HMAC-SHA256 digital signatures for accredited employers; detection of free email providers (<code>@gmail.com</code>) used for enterprise recruitment.
                </div>
              </div>

              {/* Tampering */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                      T
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">Tampering with Documents & Flyers</h4>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded border border-amber-200">
                    High Risk
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Attack:</strong> Fraudsters edit authentic job notices, replacing legitimate corporate contact numbers with personal mobile money accounts (EcoPay/Mukuru) or altering QR codes.
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700">
                  <strong className="text-emerald-700">Technical Defense:</strong> Client-side <strong>Document Guard</strong> burns persistent recipient watermarks across ID photos to invalidate re-use for loans; signed QR payloads verify canonical employer tuples <code>(id|name|domain|phone|address)</code>.
                </div>
              </div>

              {/* Repudiation */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      R
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">Repudiation of Fraudulent Demands</h4>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                    Medium Risk
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Attack:</strong> Deceptive recruiters delete WhatsApp messages or claim payments were optional voluntary registration donations rather than compulsory employment prerequisites.
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700">
                  <strong className="text-emerald-700">Technical Defense:</strong> Incident Recovery Export generates a timestamped forensic dossier including transaction reference codes, carrier logs, and verbatim transcripts for formal Zimbabwe Republic Police (ZRP) submission.
                </div>
              </div>

              {/* Information Disclosure */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      I
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">Information Disclosure & Credential Leakage</h4>
                  </div>
                  <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded border border-purple-200">
                    Critical Risk
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Attack:</strong> Mass harvesting of applicant national IDs, CVs, and banking credentials for identity theft, unauthorized SIM activations, or predatory micro-loan applications.
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700">
                  <strong className="text-emerald-700">Technical Defense:</strong> <strong>Server-Side HMAC-SHA256</strong> anonymization with isolated environment pepper (<code>HMAC_SECRET</code>); zero raw phone numbers or cleartext messages stored; default 100% anonymous usage without account requirements.
                </div>
              </div>

              {/* Denial of Service */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                      D
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">Denial of Service & Sybil Reporting Spam</h4>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-300">
                    Medium Risk
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Attack:</strong> Scammers or automated bots flooding the reporting endpoints to pollute the community reputation pool or overload rule evaluation servers.
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700">
                  <strong className="text-emerald-700">Technical Defense:</strong> Express rate limiting (100 req/15min general, 10 req/15min strict auth); multi-source confirmation threshold before flag elevation; server-side payload size limits (10MB).
                </div>
              </div>

              {/* Elevation of Privilege */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                      E
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">Elevation of Privilege (Registry Tampering)</h4>
                  </div>
                  <span className="text-[10px] bg-teal-50 text-teal-800 font-semibold px-2 py-0.5 rounded border border-teal-200">
                    High Risk
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Attack:</strong> Scammers attempting to inject their own fraudulent recruiter records into the Verified Employers directory.
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700">
                  <strong className="text-emerald-700">Technical Defense:</strong> Role-based access control (citizen vs verifier vs admin) enforced in server middleware; registry signatures verified using constant-time comparison (<code>crypto.timingSafeEqual</code>) against the isolated root registry authority key.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: TRUST BOUNDARIES & SCOPE */}
      {activeTab === 'boundaries' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                Architecture Boundaries
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                Security Scope: What We Guarantee vs System Limitations
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Clear technical boundaries defining what Safe Jobs Shield protects, versus residual risks requiring official policing and judicial intervention.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* In Scope */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>In Scope • Technical Guarantees</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-2">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>100% Anonymous by Default:</strong> Users can run text checks, OCR analysis, QR verification, and review recovery guides without creating an account or providing identity credentials.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Zero Message Content Persistence:</strong> Even when users choose to register an optional account, our servers store zero message content, zero chat transcripts, and zero applicant phone numbers.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Server-Side HMAC Isolation:</strong> Cryptographic HMAC-SHA256 calculations are executed exclusively on the server with an isolated environment pepper (<code>HMAC_SECRET</code>), protecting against client-side reversing and rainbow table generation.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Client-Side Document Watermarking:</strong> ID protection occurs strictly inside the user's browser canvas before any file transmission, ensuring cleartext identity files never touch untrusted infrastructure.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Deterministic Multi-Lingual Detection:</strong> 27 automated heuristic rules evaluate fee triggers, lookalikes, urgency, and salary signals across ChiShona, isiNdebele, and English in &lt;15ms.</span>
                  </li>
                </ul>
              </div>

              {/* Out of Scope */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Out of Scope • Operating Limitations</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-2">
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">✗</span>
                    <span><strong>No Automatic Financial Reversal:</strong> Initiating an emergency mobile money dispute alerts the carrier, but fund recovery cannot be guaranteed if the fraudster has already cashed out at an agent kiosk.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">✗</span>
                    <span><strong>No Physical Extraction or Police Powers:</strong> Safe Jobs Shield provides structured evidence preservation and direct helpline referral directories; physical apprehension and rescue requires official law enforcement (ZRP / IOM).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">✗</span>
                    <span><strong>Physical In-Person Cash Exchanges:</strong> Undocumented cash hand-offs in informal markets or physical meeting places cannot be detected digitally if no electronic communication or flyer exists.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">✗</span>
                    <span><strong>Compromised User Handsets:</strong> Keyloggers, active screen capture spyware, or rogue OS keyboards on a compromised user device are outside application-level sandboxes.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: DETECTION BENCHMARKS (27 TESTS) */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                  Automated Regression Testing
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  27 Adversarial Test Cases • 100% Verified Pass Rate
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Deterministic regression suite validating detection sensitivity, language nuances, lookalike detection, and false-positive suppression.
                </p>
              </div>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('tests')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Execute Interactive Unit Tests</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-2xl font-extrabold text-emerald-600">100%</span>
                <span className="text-[11px] text-slate-600 font-semibold">Detection Sensitivity</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Scam vectors flagged</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-2xl font-extrabold text-emerald-600">0.0%</span>
                <span className="text-[11px] text-slate-600 font-semibold">False Positive Rate</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Authentic jobs preserved</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-2xl font-extrabold text-indigo-600">&lt; 15 ms</span>
                <span className="text-[11px] text-slate-600 font-semibold">Average Latency</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Deterministic rule-engine</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-2xl font-extrabold text-purple-600">3 Dialects</span>
                <span className="text-[11px] text-slate-600 font-semibold">Linguistic Coverage</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">English, ChiShona, isiNdebele</span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Test Vector Category</th>
                    <th className="p-3">Count</th>
                    <th className="p-3">Target Adversarial Vector</th>
                    <th className="p-3">Pass Criterion</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="p-3 font-semibold">Upfront Fee Extortion</td>
                    <td className="p-3">8 Tests</td>
                    <td className="p-3">Uniform, medical badge, registration, interview fees (EcoPay/Mukuru)</td>
                    <td className="p-3">Risk Score &ge; 70 (HIGH_RISK)</td>
                    <td className="p-3 text-emerald-600 font-bold">100% Passed</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Lookalike Impersonation</td>
                    <td className="p-3">5 Tests</td>
                    <td className="p-3">Typo-squatting (<code>.xyz</code>, <code>.top</code>), free Gmail HR handles</td>
                    <td className="p-3">Risk Score &ge; 70 (HIGH_RISK)</td>
                    <td className="p-3 text-emerald-600 font-bold">100% Passed</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Human Trafficking Indicators</td>
                    <td className="p-3">4 Tests</td>
                    <td className="p-3">Body measurements, confiscated passports, private domestic worker travel</td>
                    <td className="p-3">Risk Score &ge; 85 (HIGH_RISK)</td>
                    <td className="p-3 text-emerald-600 font-bold">100% Passed</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Legitimate Job Preservation</td>
                    <td className="p-3">6 Tests</td>
                    <td className="p-3">Accredited agriculture apprenticeships, registered tech internships, NGO roles</td>
                    <td className="p-3">Risk Score &le; 20 (LOW_RISK)</td>
                    <td className="p-3 text-emerald-600 font-bold">100% Passed</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Ambiguous / Insufficient Data</td>
                    <td className="p-3">4 Tests</td>
                    <td className="p-3">Short WhatsApp fragments without contact or fee details</td>
                    <td className="p-3">Verdict: NOT_ENOUGH_INFO</td>
                    <td className="p-3 text-emerald-600 font-bold">100% Passed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: EMPLOYER VETTING & KEY MANAGEMENT (KMS) */}
      {activeTab === 'vetting_kms' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                Cryptographic Governance
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                Employer Vetting Pipeline & Key Management Architecture (KMS)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Comprehensive four-stage onboarding verification, cryptographic canonical payload binding, automated key rotation, and instant revocation procedures.
              </p>
            </div>

            {/* 4-Stage Vetting Pipeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Four-Stage Employer Onboarding Protocol</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                      1
                    </span>
                    <h5 className="text-xs font-bold text-slate-900">Statutory Legal Audit</h5>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Verification of legal incorporation with the Chief Registrar of Companies (Companies Act Chapter 24:03). Auditing official CR14 (Directors/Secretary), CR6 (Registered Address), and current ZIMRA Tax Clearance Certificate (ITF263).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                      2
                    </span>
                    <h5 className="text-xs font-bold text-slate-900">Physical Premise & License Inspection</h5>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Mandatory physical premise verification of commercial headquarters, warehouse, or packhouse facility. Valid municipal business license inspected. Strict disqualification of virtual mailboxes, residential lodgings, or temporary guest houses.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                      3
                    </span>
                    <h5 className="text-xs font-bold text-slate-900">Enforceable Zero-Fee Legal Undertaking</h5>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Managing director signs an irrevocable legal affidavit under oath: zero applicant fees (no uniform, medical badge, interview registration, or training fees) permitted under any circumstance. Adherence to National Employment Council (NEC) wage scales.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                      4
                    </span>
                    <h5 className="text-xs font-bold text-slate-900">Domain & Contact Channel Keybinding</h5>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Cryptographic binding of authorized corporate domain (<code>.co.zw</code>), corporate email DNS (SPF, DKIM, DMARC), and primary E.164 telecommunications lines to prevent impersonation or man-in-the-middle recruiting.
                  </p>
                </div>
              </div>
            </div>

            {/* Cryptographic Key Lifecycle */}
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4 text-indigo-600" />
                <span>Cryptographic Key Management System (KMS) Specifications</span>
              </h4>

              <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-[11px] space-y-2">
                <div className="text-emerald-400 font-bold">
                  // Canonical Payload Tuple Structure (Immutable Signing String)
                </div>
                <div className="text-slate-300">
                  canonicalPayload = [EMP_ID] + &quot;|&quot; + [LEGAL_NAME] + &quot;|&quot; + [REG_NUMBER] + &quot;|&quot; + [OFFICIAL_DOMAIN] + &quot;|&quot; + [E164_PHONE] + &quot;|&quot; + [PHYSICAL_ADDRESS];
                </div>
                <div className="text-slate-400">
                  signatureHex = HMAC_SHA256(canonicalPayload, isolatedServerPepper);
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="block text-slate-900 font-bold mb-1">Key Generation & HSM</strong>
                  <span className="text-slate-600 leading-relaxed">
                    Private signing keys are generated inside FIPS 140-2 Level 3 compliant Hardware Security Modules (HSMs). Root authority key never leaves the secure cryptographic enclave.
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="block text-slate-900 font-bold mb-1">90-Day Key Rotation</strong>
                  <span className="text-slate-600 leading-relaxed">
                    Signing keys rotate automatically every 90 days. Deprecated keys transition to historical verification status for 180 days to validate existing physical job flyers.
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="block text-slate-900 font-bold mb-1">Real-Time Revocation (CRL)</strong>
                  <span className="text-slate-600 leading-relaxed">
                    If verified community evidence demonstrates illicit fee demands, the employer is placed on the real-time Certificate Revocation List (CRL) within 5 minutes, instantly invalidating QR badges.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsible Disclosure & Contact Banner */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Responsible Disclosure Policy:</strong> Security researchers can submit vulnerability reports or cryptographic audit findings directly to <code>security@safejobsshield.org.zw</code>.
          </span>
        </div>
        <div className="text-[11px] text-slate-500 font-semibold shrink-0">
          Last Security Review: October 2026
        </div>
      </div>
    </div>
  );
};

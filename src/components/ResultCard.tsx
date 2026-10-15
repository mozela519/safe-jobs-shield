import React, { useState } from 'react';
import { DetectionResult, Language } from '../types';
import { translations } from '../i18n/translations';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  ArrowRight,
  ExternalLink,
  Info,
  BookOpen,
  LifeBuoy,
  Volume2,
} from 'lucide-react';
import { MicroLessonModal } from './MicroLessonModal';
import { getMicroLessonForVerdict } from '../data/microLessons';

interface ResultCardProps {
  result: DetectionResult;
  language: Language;
  onOpenReport: (prefillIdentifier?: string) => void;
  onOpenEmployers: () => void;
  onOpenRecovery?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  language,
  onOpenReport,
  onOpenEmployers,
  onOpenRecovery,
}) => {
  const t = translations[language];
  const [showFormula, setShowFormula] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [microLessonOpen, setMicroLessonOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const signalIds = result.signals.map((s) => s.id);
  const currentMicroLesson = getMicroLessonForVerdict(signalIds, result.verdict);

  const handleSpeakVerdict = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const verdictTitle = result.verdictLabel[language] || result.verdictLabel.en;
    const summaryText = result.summary[language] || result.summary.en;
    const adviceText = (result.actionAdvice[language] || result.actionAdvice.en).slice(0, 2).join('. ');
    const fullSpeech = `${verdictTitle}. ${summaryText}. Key recommended steps: ${adviceText}`;

    const utterance = new SpeechSynthesisUtterance(fullSpeech);
    utterance.lang = language === 'sn' ? 'sn-ZW' : language === 'nd' ? 'nd-ZW' : 'en-ZW';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getVerdictStyle = () => {
    switch (result.verdict) {
      case 'LOW_RISK':
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
          badge: 'bg-emerald-600 text-white',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
          barColor: 'bg-emerald-500',
        };
      case 'SUSPICIOUS':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-950',
          badge: 'bg-amber-600 text-white',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          barColor: 'bg-amber-500',
        };
      case 'HIGH_RISK':
        return {
          bg: 'bg-rose-50 border-rose-300 text-rose-950',
          badge: 'bg-rose-600 text-white',
          icon: <ShieldAlert className="w-6 h-6 text-rose-600" />,
          barColor: 'bg-rose-600',
        };
      case 'NOT_ENOUGH_INFO':
      default:
        return {
          bg: 'bg-slate-50 border-slate-300 text-slate-900',
          badge: 'bg-slate-600 text-white',
          icon: <HelpCircle className="w-6 h-6 text-slate-600" />,
          barColor: 'bg-slate-400',
        };
    }
  };

  const style = getVerdictStyle();

  const handleRequestAiExplanation = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redactedText: result.redactedText,
          verdict: result.verdict,
          reasons: result.signals.map((s) => s.description[language] || s.description.en),
          language,
        }),
      });

      const data = await response.json();
      if (response.ok && data.explanation) {
        setAiExplanation(data.explanation);
      } else {
        // Graceful fallback to rule-based explanation
        setAiExplanation(
          `${result.summary[language] || result.summary.en} ${
            result.actionAdvice[language]?.[0] || result.actionAdvice.en[0]
          }`
        );
        setAiError(data.error ? `Using defensive rule summary (${data.error})` : null);
      }
    } catch (err: any) {
      console.warn('AI Explanation call failed, falling back to local deterministic rule text:', err);
      setAiExplanation(
        `${result.summary[language] || result.summary.en} ${
          result.actionAdvice[language]?.[0] || result.actionAdvice.en[0]
        }`
      );
      setAiError('Offline mode: Showing deterministic rule-based advice.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden transition-all ${style.bg}`}>
      {/* Header Banner */}
      <div className="p-4 sm:p-5 border-b border-black/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm shrink-0">
              {style.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                  {result.verdictLabel[language] || result.verdictLabel.en}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(result.evaluationTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mt-1 text-slate-900">
                {t.verdicts[result.verdict].title}
              </h3>
            </div>
          </div>

          {/* Risk Gauge */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-black/5 min-w-[180px]">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-semibold text-slate-600">{t.riskScoreLabel}</span>
              <span className="text-lg font-black font-mono text-slate-900">
                {result.score}<span className="text-xs text-slate-400 font-normal">/100</span>
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${style.barColor}`}
                style={{ width: `${Math.max(5, result.score)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 (Safe)</span>
              <span>50</span>
              <span>100 (Critical)</span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {result.summary[language] || result.summary.en}
        </p>
      </div>

      {/* Emergency Helpline Banner if trafficking flags triggered */}
      {result.isEmergencyOrTrafficking && result.helplineInfo && (
        <div className="bg-rose-700 text-white p-4 border-y border-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-800 rounded-lg shrink-0">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
                <span>{t.emergencyAlertTitle}</span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5 max-w-2xl">
                {result.helplineInfo.description[language] || result.helplineInfo.description.en}
              </p>
            </div>
          </div>
          <a
            href={`tel:${result.helplineInfo.number}`}
            className="bg-white text-rose-900 hover:bg-rose-50 font-bold text-xs sm:text-sm px-4 py-2 rounded-lg shadow shrink-0 flex items-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4 text-rose-700" />
            <span>{result.helplineInfo.number} (Toll-Free)</span>
          </a>
        </div>
      )}

      {/* Verified Employer Alert if matched */}
      {result.matchedEmployer && (
        <div className={`p-4 border-b ${result.employerSignatureValid ? 'bg-emerald-100/70 border-emerald-300' : 'bg-amber-100 border-amber-300'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${result.employerSignatureValid ? 'text-emerald-700' : 'text-amber-700'}`} />
              <div>
                <div className="text-xs font-semibold text-emerald-900 flex flex-wrap items-center gap-1.5">
                  <span className="font-bold">{t.verifiedEmployerFound}:</span>
                  <span className="underline decoration-emerald-500">{result.matchedEmployer.name}</span>
                  <span className="bg-emerald-700 text-white text-[10px] px-1.5 py-0.2 rounded font-mono">
                    {result.matchedEmployer.registrationNumber}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Official Domain: <span className="font-mono font-medium">{result.matchedEmployer.domain}</span> • Official Tel: {result.matchedEmployer.officialPhone}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono font-medium ${
                    result.employerSignatureValid ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                  }`}>
                    <Lock className="w-3 h-3" />
                    {result.employerSignatureValid ? t.verifiedEmployerSignatureValid : t.verifiedEmployerSignatureInvalid}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenEmployers}
              className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 shadow-sm"
            >
              <span>View Registry</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Signal & Action Columns */}
      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Signals & Red Flags */}
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.signalsDetectedTitle} ({result.signals.length})</span>
            </h4>

            {result.signals.length === 0 ? (
              <div className="bg-white/60 p-3 rounded-lg border border-black/5 text-xs text-slate-600 italic">
                No high-risk scam patterns detected in the analyzed text.
              </div>
            ) : (
              <div className="space-y-2">
                {result.signals.map((sig) => (
                  <div
                    key={sig.id}
                    className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {sig.label[language] || sig.label.en}
                      </span>
                      <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 shrink-0">
                        +{sig.weight} pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {sig.description[language] || sig.description.en}
                    </p>
                    {sig.matchedKeywords && sig.matchedKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sig.matchedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-700 font-mono px-1.5 py-0.5 rounded border border-slate-200"
                          >
                            &quot;{kw}&quot;
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Positive Safety Signals */}
          {result.positiveSignals.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.positiveFactorsTitle} ({result.positiveSignals.length})</span>
              </h4>
              <div className="space-y-2">
                {result.positiveSignals.map((pos) => (
                  <div
                    key={pos.id}
                    className="bg-emerald-50/90 p-2.5 rounded-lg border border-emerald-200 text-xs"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-emerald-950">
                        {pos.label[language] || pos.label.en}
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                        {pos.weight} pts
                      </span>
                    </div>
                    <p className="text-emerald-800 text-[11px] mt-0.5">
                      {pos.description[language] || pos.description.en}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Safe Next Steps & Action Pathways */}
        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.recommendedStepsTitle}</span>
            </h4>
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-2.5">
              {(result.actionAdvice[language] || result.actionAdvice.en).map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="leading-relaxed font-medium">{step}</span>
                </div>
              ))}
            </div>

            {/* Optional AI Explanation Section */}
            <div className="mt-4 bg-white/90 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Explain in Simple Words</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSpeakVerdict}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1 transition-all cursor-pointer ${
                      isSpeaking
                        ? 'bg-emerald-700 text-white animate-pulse'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                    title="Audibly read the verdict and advice in local language"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeaking ? 'Reading Audio...' : 'Listen to Verdict'}</span>
                  </button>

                  {!aiExplanation && (
                    <button
                      onClick={handleRequestAiExplanation}
                      disabled={aiLoading}
                      className="text-xs bg-purple-700 hover:bg-purple-800 text-white font-medium px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{aiLoading ? 'Explaining...' : t.explainWithAiButton}</span>
                    </button>
                  )}
                </div>
              </div>

              {aiLoading && (
                <div className="p-3 bg-purple-50 text-purple-900 rounded-md text-xs flex items-center gap-2 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
                  <span>{t.explainWithAiLoading}</span>
                </div>
              )}

              {aiExplanation && (
                <div className="p-3 bg-purple-50/80 rounded-md border border-purple-200 text-xs text-purple-950">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[11px] text-purple-900 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      AI Plain-Language Summary:
                    </span>
                    <span className="text-[10px] text-purple-700 font-mono">Privacy-redacted input</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">{aiExplanation}</p>
                  {aiError && (
                    <p className="text-[10px] text-purple-700 mt-1 italic">{aiError}</p>
                  )}
                </div>
              )}

              {!aiExplanation && !aiLoading && (
                <p className="text-[11px] text-slate-500 leading-normal">
                  {t.explainWithAiDesc}
                </p>
              )}
            </div>
          </div>

          {/* Result Card Primary Pathways: Check Employer / Report / Get Help */}
          <div className="pt-2 border-t border-slate-200/60 mt-3 space-y-2">
            {/* Why? Micro-Lesson Trigger Banner */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-300/80 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-500 text-white rounded-lg">
                  <BookOpen className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Learn Before You Apply
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    &quot;Why?&quot; 20-Second Micro-Lesson
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMicroLessonOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
              >
                <span>Take Lesson</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Direct Action Pathways: Check Employer / Report / Get Help */}
            <div className="flex flex-wrap gap-2 pt-1">
              {/* 1. Check Employer */}
              <button
                onClick={onOpenEmployers}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Check Employer</span>
              </button>

              {/* 2. Report */}
              <button
                onClick={() =>
                  onOpenReport(
                    result.entities.phones[0] || result.entities.urls[0] || result.entities.emails[0]
                  )
                }
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report Scam</span>
              </button>

              {/* 3. Get Help (Recovery Guide) */}
              {onOpenRecovery && (
                <button
                  onClick={onOpenRecovery}
                  className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LifeBuoy className="w-3.5 h-3.5" />
                  <span>Get Help / Recovery</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Algorithmic Transparency Accordion */}
      <div className="bg-slate-100/90 border-t border-slate-200 p-3 sm:px-5">
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.transparentLogicTitle}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>{showFormula ? 'Hide Formula' : 'View Scoring Breakdown'}</span>
            {showFormula ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showFormula && (
          <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-2">
            <p className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
              Risk Score = clamp(0, 100, Base + Σ(Red Flag Weights) + Σ(Positive Trust Credits))
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="font-bold text-slate-700">Triggered Additions:</span>
                <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                  {result.signals.length === 0 ? (
                    <li>None (+0)</li>
                  ) : (
                    result.signals.map((s) => (
                      <li key={s.id}>
                        {s.id}: <span className="font-mono text-rose-700 font-bold">+{s.weight}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div>
                <span className="font-bold text-slate-700">Trust Credits:</span>
                <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                  {result.positiveSignals.length === 0 ? (
                    <li>None (-0)</li>
                  ) : (
                    result.positiveSignals.map((p) => (
                      <li key={p.id}>
                        {p.id}: <span className="font-mono text-emerald-700 font-bold">{p.weight}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              Governing Rule: In strict compliance with defensive evaluation ethics, verdicts are purely diagnostic probability assessments and never accusations against individuals.
            </p>
          </div>
        )}
      </div>

      {/* "Why?" Micro-Lesson Modal */}
      {microLessonOpen && (
        <MicroLessonModal
          lesson={currentMicroLesson}
          language={language}
          isOpen={microLessonOpen}
          onClose={() => setMicroLessonOpen(false)}
          onTakeAction={(actionType) => {
            if (actionType === 'check_employer') {
              onOpenEmployers();
            } else if (actionType === 'report') {
              onOpenReport(
                result.entities.phones[0] || result.entities.urls[0] || result.entities.emails[0]
              );
            } else if (actionType === 'get_help' && onOpenRecovery) {
              onOpenRecovery();
            }
          }}
        />
      )}
    </div>
  );
};

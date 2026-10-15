import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { MicroLesson } from '../data/microLessons';
import {
  Sparkles,
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  X,
  Play,
  RotateCcw,
  Volume2,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface MicroLessonModalProps {
  lesson: MicroLesson;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onTakeAction?: (actionType: 'check_employer' | 'report' | 'get_help') => void;
}

export const MicroLessonModal: React.FC<MicroLessonModalProps> = ({
  lesson,
  language,
  isOpen,
  onClose,
  onTakeAction,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(lesson.durationSeconds || 20);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // 20-second countdown timer for active engagement
  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(lesson.durationSeconds || 20);
      setIsTimerRunning(true);
      return;
    }

    if (!isTimerRunning || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isTimerRunning, secondsRemaining, lesson]);

  if (!isOpen) return null;

  const headline = lesson.headline[language] || lesson.headline.en;
  const rule = lesson.ruleOfThumb[language] || lesson.ruleOfThumb.en;
  const whyScam = lesson.whyScammersDoIt[language] || lesson.whyScammersDoIt.en;
  const whatLegit = lesson.whatLegitEmployersDo[language] || lesson.whatLegitEmployersDo.en;
  const proTip = lesson.proTip[language] || lesson.proTip.en;

  const progressPercent = Math.min(
    100,
    Math.max(0, ((lesson.durationSeconds - secondsRemaining) / lesson.durationSeconds) * 100)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col text-slate-900">
        {/* Header with Progress Bar */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-4 sm:p-5 relative rounded-t-2xl">
          {/* 20-Second Progress Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/20 overflow-hidden">
            <div
              className="h-full bg-amber-200 transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-start justify-between gap-3 pt-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-white/20 rounded-xl backdrop-blur-xs text-white">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded-full text-amber-100">
                    &quot;Why?&quot; Micro-Lesson
                  </span>
                  <span className="text-[11px] font-mono font-semibold flex items-center gap-1 text-amber-100">
                    <Clock className="w-3.5 h-3.5" />
                    {secondsRemaining > 0 ? `${secondsRemaining}s remaining` : 'Complete!'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                  {headline}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Lesson"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Rule of thumb highlight box */}
          <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl text-amber-950 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider text-[11px] text-amber-800 block">
                The Golden Rule:
              </span>
              <p className="font-semibold text-xs sm:text-sm text-amber-950 mt-0.5 leading-relaxed">
                {rule}
              </p>
            </div>
          </div>

          {/* Breakdown: Why scammers do it vs what real employers do */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs mb-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Why Scammers Do It:</span>
              </div>
              <p className="text-xs text-rose-950 leading-relaxed">
                {whyScam}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>What Real Employers Do:</span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">
                {whatLegit}
              </p>
            </div>
          </div>

          {/* Pro Action Tip */}
          <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs text-slate-800">Defensive Shield Tip:</span>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {proTip}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 italic">
            Safe Jobs Youth Academy • Learn red flags before you apply
          </div>

          <div className="flex items-center gap-2">
            {onTakeAction && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onTakeAction('check_employer');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer transition-colors"
                >
                  Check Employer
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onTakeAction('get_help');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors"
                >
                  Get Help / Recover
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

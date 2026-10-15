import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { ShieldCheck, Lock, ExternalLink } from 'lucide-react';

interface ConsentBannerProps {
  language: Language;
  onAccept: () => void;
  onOpenPrivacy: () => void;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({
  language,
  onAccept,
  onOpenPrivacy,
}) => {
  const t = translations[language];

  return (
    <div className="bg-slate-900 border-b border-emerald-500/30 text-slate-100 p-3 sm:p-4 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-emerald-900/60 rounded-md text-emerald-400 mt-0.5 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-emerald-300 flex items-center gap-2">
              <span>{t.consentBannerTitle}</span>
              <span className="bg-emerald-950 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-800">
                POTRAZ Aligned
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-0.5 max-w-4xl leading-relaxed">
              {t.consentBannerBody}{' '}
              <span className="text-slate-400">
                Identifiers are converted via server-side HMAC-SHA256 with an isolated environment pepper. Anonymous usage is the default; no registration is required, and optional accounts store zero message content.
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={onOpenPrivacy}
            className="text-xs text-emerald-300 hover:text-emerald-100 flex items-center gap-1 underline underline-offset-2 px-2 py-1"
          >
            <span>{t.consentLearnMore}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={onAccept}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
          >
            {t.consentAccept}
          </button>
        </div>
      </div>
    </div>
  );
};

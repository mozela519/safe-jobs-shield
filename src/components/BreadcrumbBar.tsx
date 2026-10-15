import React from 'react';
import { AppTab, Language } from '../types';
import { translations } from '../i18n/translations';
import {
  Shield,
  MessageSquare,
  Camera,
  Globe,
  FileCheck,
  QrCode,
  LifeBuoy,
  Building2,
  FileText,
  Lock,
  Cpu,
  Users,
  HelpCircle,
  ChevronRight,
  PhoneCall,
  Search,
} from 'lucide-react';

interface BreadcrumbBarProps {
  currentTab: AppTab;
  onNavigateTab: (tab: AppTab) => void;
  language: Language;
  onOpenSearch?: () => void;
  checksCount?: number;
}

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({
  currentTab,
  onNavigateTab,
  language,
  onOpenSearch,
  checksCount = 0,
}) => {
  const t = translations[language];

  // Group definitions for contextual navigation
  const isVerificationGroup = ['chat', 'ocr', 'lookalike', 'docguard', 'signedads'].includes(currentTab);
  const isStandardsGroup = ['howitworks', 'privacy', 'inclusion', 'tests'].includes(currentTab);

  const verificationTools: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'Text & Voice Analyzer', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'ocr', label: 'Flyer & Screenshot OCR', icon: <Camera className="w-3.5 h-3.5" /> },
    { id: 'lookalike', label: 'Website & Domain Check', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'docguard', label: 'Watermark ID Card', icon: <FileCheck className="w-3.5 h-3.5" /> },
    { id: 'signedads', label: 'Verify QR Signed Ad', icon: <QrCode className="w-3.5 h-3.5" /> },
  ];

  const standardsTools: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'howitworks', label: 'How It Works', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'privacy', label: 'Data Protection Act [12:07]', icon: <Lock className="w-3.5 h-3.5" /> },
    { id: 'inclusion', label: 'USSD *707# & Inclusion', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'tests', label: 'Engine Tests (27)', icon: <Cpu className="w-3.5 h-3.5" /> },
  ];

  // Derive human-friendly section name
  const getSectionInfo = (tab: AppTab): { section: string; title: string; subtitle: string } => {
    switch (tab) {
      case 'chat':
        return {
          section: 'Verification Hub',
          title: 'Offer Text & Voice Analyzer',
          subtitle: 'Paste WhatsApp messages, SMS, or speak suspicious job adverts for defensive heuristics analysis.',
        };
      case 'ocr':
        return {
          section: 'Verification Hub',
          title: 'Flyer & Poster OCR Scanner',
          subtitle: 'Upload physical flyers, newspaper clippings, or WhatsApp statuses to extract recruiter contacts.',
        };
      case 'lookalike':
        return {
          section: 'Verification Hub',
          title: 'Lookalike Domain & Website Detector',
          subtitle: 'Verify if a career portal link is an impersonation spoof of reputable Zimbabwean employers.',
        };
      case 'docguard':
        return {
          section: 'Verification Hub',
          title: 'Document Guard (ID Watermarking)',
          subtitle: 'Apply tamper-resistant, employer-specific safety watermarks to national IDs and CVs in-browser.',
        };
      case 'signedads':
        return {
          section: 'Verification Hub',
          title: 'Cryptographically Signed Vacancies',
          subtitle: 'Scan QR codes to mathematically confirm job authenticity before submitting documents.',
        };
      case 'mychecks':
        return {
          section: 'Personal Safety',
          title: 'My Verification Records',
          subtitle: 'Session history of scanned job identifiers, verified employers, and watermarked documents.',
        };
      case 'recovery':
        return {
          section: 'Emergency Response',
          title: 'Incident Recovery Guide ("I Already Paid or Shared")',
          subtitle: 'Immediate containment checklists, mobile money reversal contacts, and police report templates.',
        };
      case 'employers':
        return {
          section: 'Employment Pathway',
          title: 'Verified Employers Registry',
          subtitle: 'Verified corporate recruiting channels that never charge application or placement fees.',
        };
      case 'roadmap':
        return {
          section: 'Employment Pathway',
          title: 'Safe Interview Plan & Early Warning',
          subtitle: 'Interactive safety planning, embassy alerts for overseas jobs, and youth safety ambassador tools.',
        };
      case 'report':
        return {
          section: 'Community Shield',
          title: 'Scam Reporting Desk',
          subtitle: 'Submit verified fraudulent numbers or fake recruiter links to protect job seekers nationwide.',
        };
      case 'howitworks':
        return {
          section: 'Trust & Standards',
          title: 'How Safe Jobs Shield Works',
          subtitle: 'Complete architectural walkthrough of rule weighting, privacy hashing, and verification pathways.',
        };
      case 'privacy':
        return {
          section: 'Trust & Standards',
          title: 'Cyber and Data Protection Act [12:07]',
          subtitle: 'Legal and cryptographic guarantees: server-side HMAC-SHA256 anonymization and zero cleartext retention.',
        };
      case 'inclusion':
        return {
          section: 'Trust & Standards',
          title: 'Youth & Rural Inclusion (USSD *707#)',
          subtitle: 'Accessible verification channels for feature phones without data bundles or smartphones.',
        };
      case 'tests':
        return {
          section: 'Trust & Standards',
          title: 'Defensive Engine Benchmarks',
          subtitle: '27 automated unit tests proving defensive accuracy against real-world Zimbabwean scam cases.',
        };
      case 'threatmodel':
        return {
          section: 'Trust & Standards',
          title: 'Threat Model & Evaluation',
          subtitle: 'STRIDE vulnerability analysis, trust boundaries, detection benchmarks, and employer KMS specifications.',
        };
      case 'auth':
      case 'account':
        return {
          section: 'User Profile',
          title: 'Citizen Account & Security Center',
          subtitle: 'Anonymous use is default. Optional accounts hold zero message content or conversation text.',
        };
      default:
        return { section: 'Home', title: 'Defensive Employment Shield', subtitle: 'National Job Safety Verification' };
    }
  };

  const info = getSectionInfo(currentTab);

  return (
    <div className="bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        {/* Top Breadcrumb Path + Quick Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-2">
          {/* Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-500 font-medium">
            <button
              onClick={() => onNavigateTab('chat')}
              className="hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe Jobs Shield</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-600 font-semibold">{info.section}</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-900 font-bold">{info.title}</span>
          </nav>

          {/* Quick Search / Command Palette Trigger & Helpline */}
          <div className="flex items-center gap-2">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-medium border border-slate-200 transition-all cursor-pointer"
                title="Search employers, tools, and scam signals (Press Cmd+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span>Search tools or employers...</span>
                <kbd className="bg-white px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 border border-slate-300">
                  ⌘K
                </kbd>
              </button>
            )}

            <a
              href="tel:08080074"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold border border-rose-200 transition-colors"
              title="Zimbabwe National GBV & Anti-Trafficking Helpline (Toll-Free 08080074)"
            >
              <PhoneCall className="w-3 h-3 text-rose-600" />
              <span>Helpline: 08080074</span>
            </a>
          </div>
        </div>

        {/* Header Title & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              {info.title}
            </h1>
            <p className="text-xs text-slate-600 max-w-3xl mt-0.5 leading-relaxed">
              {info.subtitle}
            </p>
          </div>
        </div>

        {/* Sub-Navigation: Verification Tools Segmented Switcher */}
        {isVerificationGroup && (
          <div className="mt-3.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Select Verification Tool:
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                5 specialized detection engines
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {verificationTools.map((tool) => {
                const isActive = currentTab === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => onNavigateTab(tool.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    {tool.icon}
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sub-Navigation: Trust & Standards Segmented Switcher */}
        {isStandardsGroup && (
          <div className="mt-3.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Trust, Law & Transparency:
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {standardsTools.map((tool) => {
                const isActive = currentTab === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => onNavigateTab(tool.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    {tool.icon}
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

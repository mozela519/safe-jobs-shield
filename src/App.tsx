import React, { useState, useEffect } from 'react';
import { Language, ScamReport, AppTab, SessionCheckItem } from './types';
import { translations } from './i18n/translations';
import { Navbar } from './components/Navbar';
import { ConsentBanner } from './components/ConsentBanner';
import { ChatSimulator } from './components/ChatSimulator';
import { DocumentGuard } from './components/DocumentGuard';
import { ScreenshotOcrScanner } from './components/ScreenshotOcrScanner';
import { LookalikeDetector } from './components/LookalikeDetector';
import { SignedJobAdsQr } from './components/SignedJobAdsQr';
import { RecoveryGuide } from './components/RecoveryGuide';
import { VerifiedEmployersPanel } from './components/VerifiedEmployersPanel';
import { RoadmapHub } from './components/RoadmapHub';
import { PrivacyPanel } from './components/PrivacyPanel';
import { ReportModal } from './components/ReportModal';
import { UnitTestsPanel } from './components/UnitTestsPanel';
import { InclusionPage } from './components/InclusionPage';
import { HowItWorksPage } from './components/HowItWorksPage';
import { MyChecksPanel } from './components/MyChecksPanel';
import { AuthPage } from './components/AuthPage';
import { EvaluationThreatModel } from './components/EvaluationThreatModel';
import { BreadcrumbBar } from './components/BreadcrumbBar';
import { CommandPalette } from './components/CommandPalette';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  loadSessionChecks,
  saveSessionChecks,
  INITIAL_SESSION_CHECKS,
} from './data/sessionChecksData';
import { computeHmacSha256 } from './crypto/privacy';
import { ShieldCheck, Info, FileText, Heart } from 'lucide-react';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<AppTab>('chat');
  const [language, setLanguage] = useState<Language>('en');
  const [textOnlyMode, setTextOnlyMode] = useState<boolean>(false);
  const [consentAccepted, setConsentAccepted] = useState<boolean>(false);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportPrefill, setReportPrefill] = useState<string>('');
  const [sessionReportCount, setSessionReportCount] = useState<number>(0);

  // Session checks tracking (job identifiers and documents scanned in this session)
  const [sessionChecks, setSessionChecks] = useState<SessionCheckItem[]>(() => loadSessionChecks());
  const [myChecksDrawerOpen, setMyChecksDrawerOpen] = useState<boolean>(false);
  const [docGuardPrefillEmployer, setDocGuardPrefillEmployer] = useState<string>('');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  // Global Cmd+K / Ctrl+K keyboard shortcut for Command Palette & Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRecordCheck = (newCheck: SessionCheckItem) => {
    setSessionChecks((prev) => {
      const filtered = prev.filter((item) => item.id !== newCheck.id);
      const updated = [newCheck, ...filtered];
      saveSessionChecks(updated);
      return updated;
    });
  };

  const handleDeleteCheck = (id: string) => {
    setSessionChecks((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveSessionChecks(updated);
      return updated;
    });
  };

  const handleClearChecks = () => {
    setSessionChecks([]);
    saveSessionChecks([]);
  };

  const handleAddSampleCheck = () => {
    setSessionChecks(INITIAL_SESSION_CHECKS);
    saveSessionChecks(INITIAL_SESSION_CHECKS);
  };

  const handleOpenDocGuardWithEmployer = (employer?: string) => {
    if (employer) setDocGuardPrefillEmployer(employer);
    setCurrentTab('docguard');
    setMyChecksDrawerOpen(false);
  };

  // Persistent community reputation counter synchronized with backend API
  const [communityReputationPool, setCommunityReputationPool] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadReputation() {
      try {
        const hash1 = await computeHmacSha256('+263 77 999 1122');
        const hash2 = await computeHmacSha256('fake-careers.xyz');
        const hash3 = await computeHmacSha256('0773129840');

        const res = await fetch('/api/reports/reputation/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hashes: [hash1, hash2, hash3] }),
        });
        if (res.ok) {
          const data = await res.json();
          setCommunityReputationPool(data.results || { [hash1]: 4, [hash2]: 7, [hash3]: 3 });
        } else {
          setCommunityReputationPool({
            [hash1]: 4,
            [hash2]: 7,
            [hash3]: 3,
          });
        }
      } catch (e) {
        console.warn('API reputation fetch fallback to cache:', e);
      }
    }
    loadReputation();
  }, []);

  const communityReportLookup = (hashedId: string): number => {
    return communityReputationPool[hashedId] || 0;
  };

  const handleOpenReport = (prefillIdentifier?: string) => {
    setReportPrefill(prefillIdentifier || '');
    setReportModalOpen(true);
  };

  const handleAddCommunityReport = async (report: ScamReport) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hashedIdentifier: report.hashedIdentifier,
          targetType: report.targetType,
          category: report.category,
        }),
      });
      const data = await res.json();
      const updatedCount = data.count || (communityReputationPool[report.hashedIdentifier] || 0) + 1;

      setCommunityReputationPool((prev) => ({
        ...prev,
        [report.hashedIdentifier]: updatedCount,
      }));
    } catch (e) {
      console.warn('Could not post report to backend, updating in-memory cache:', e);
      setCommunityReputationPool((prev) => ({
        ...prev,
        [report.hashedIdentifier]: (prev[report.hashedIdentifier] || 0) + 1,
      }));
    }
    setSessionReportCount((prev) => prev + 1);
  };

  const t = translations[language];

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        textOnlyMode
          ? 'bg-slate-50 text-slate-900 font-sans'
          : 'bg-slate-100/80 text-slate-900'
      }`}
    >
      {/* Primary Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
        textOnlyMode={textOnlyMode}
        setTextOnlyMode={setTextOnlyMode}
        checksCount={sessionChecks.length}
        onOpenMyChecks={() => setMyChecksDrawerOpen(true)}
        onOpenSearch={() => setCommandPaletteOpen(true)}
        onOpenReport={() => setReportModalOpen(true)}
      />

      {/* Consent Banner (Zimbabwe Cyber and Data Protection Act) */}
      {!consentAccepted && (
        <ConsentBanner
          language={language}
          onAccept={() => setConsentAccepted(true)}
          onOpenPrivacy={() => setCurrentTab('privacy')}
        />
      )}

      {/* Spatial Context, Responsive Breadcrumbs & Quick Tool Switcher */}
      <BreadcrumbBar
        currentTab={currentTab}
        onNavigateTab={(tab) => setCurrentTab(tab)}
        language={language}
        onOpenSearch={() => setCommandPaletteOpen(true)}
        checksCount={sessionChecks.length}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Core Chat Shield (CHECK Home: paste, forward, speak, upload screenshot/flyer OCR) */}
        {currentTab === 'chat' && (
          <ChatSimulator
            language={language}
            onOpenReport={handleOpenReport}
            onOpenEmployers={() => setCurrentTab('employers')}
            onOpenRecovery={() => setCurrentTab('recovery')}
            onOpenOcr={() => setCurrentTab('ocr')}
            onRecordCheck={handleRecordCheck}
            communityReportLookup={communityReportLookup}
            textOnlyMode={textOnlyMode}
          />
        )}

        {/* My Checks Dedicated Full View */}
        {currentTab === 'mychecks' && (
          <MyChecksPanel
            language={language}
            checks={sessionChecks}
            isDrawer={false}
            onOpenReport={handleOpenReport}
            onOpenDocGuard={handleOpenDocGuardWithEmployer}
            onOpenEmployers={() => setCurrentTab('employers')}
            onOpenLookalike={() => setCurrentTab('lookalike')}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onClearChecks={handleClearChecks}
            onDeleteCheck={handleDeleteCheck}
            onAddSampleCheck={handleAddSampleCheck}
          />
        )}

        {/* 1. Document Guard (Client-side ID watermarking + safety guide) */}
        {currentTab === 'docguard' && (
          <DocumentGuard
            language={language}
            prefillEmployer={docGuardPrefillEmployer}
            onRecordCheck={handleRecordCheck}
          />
        )}

        {/* 2. Scam Poster and Screenshot Check (OCR Scanner) */}
        {currentTab === 'ocr' && (
          <ScreenshotOcrScanner
            language={language}
            onOpenReport={handleOpenReport}
            onOpenEmployers={() => setCurrentTab('employers')}
            onOpenRecovery={() => setCurrentTab('recovery')}
            onRecordCheck={handleRecordCheck}
          />
        )}

        {/* 3. Lookalike Impersonation Detector */}
        {currentTab === 'lookalike' && (
          <LookalikeDetector language={language} />
        )}

        {/* 4. Incident Recovery Guide ("I Already Paid or Shared") */}
        {currentTab === 'recovery' && (
          <RecoveryGuide language={language} />
        )}

        {/* 5. Signed Job Ads with QR Verification */}
        {currentTab === 'signedads' && (
          <SignedJobAdsQr
            language={language}
            onRecordCheck={handleRecordCheck}
          />
        )}

        {/* Verified Employers Registry & Audit Modal */}
        {currentTab === 'employers' && (
          <VerifiedEmployersPanel
            language={language}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {/* Roadmap Initiatives (Safe Interview Plan, Early-Warning Dashboard, Youth Ambassadors) */}
        {currentTab === 'roadmap' && (
          <RoadmapHub language={language} />
        )}

        {/* Privacy by Design & Zimbabwe Data Protection Act */}
        {currentTab === 'privacy' && (
          <PrivacyPanel language={language} />
        )}

        {/* Algorithm Transparency & 27 Unit Tests */}
        {currentTab === 'tests' && (
          <UnitTestsPanel language={language} />
        )}

        {/* Inclusion, USSD *707#, Rural Access & Budget */}
        {currentTab === 'inclusion' && (
          <InclusionPage language={language} />
        )}

        {/* How It Works Explainer */}
        {currentTab === 'howitworks' && (
          <HowItWorksPage
            language={language}
            onOpenChat={() => setCurrentTab('chat')}
          />
        )}

        {/* Community Scam Reporting Form */}
        {currentTab === 'report' && (
          <div className="max-w-2xl mx-auto py-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md text-center space-y-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Community Scam Reporting Desk
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Report deceptive recruiters, fake interview fees, or suspicious links. We generate an irreversible HMAC-SHA256 hash to protect future applicants across Zimbabwe while safeguarding user privacy.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow cursor-pointer transition-colors"
                >
                  Open Report Submission Form
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Authentication & User Account Management */}
        {(currentTab === 'auth' || currentTab === 'account') && (
          <AuthPage
            language={language}
            initialMode={currentTab === 'account' ? 'account' : 'login'}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {/* Evaluation & Threat Model */}
        {currentTab === 'threatmodel' && (
          <EvaluationThreatModel
            language={language}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 px-4 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Safe Jobs Shield</span>
            <span>•</span>
            <span>National Employment Protection Network • Zimbabwe</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 text-[11px] text-slate-400">
            <button
              onClick={() => setCurrentTab('account')}
              className="hover:text-emerald-300 transition-colors cursor-pointer text-emerald-400 font-semibold"
            >
              Sign In / Account
            </button>
            <button
              onClick={() => setCurrentTab('mychecks')}
              className="hover:text-emerald-300 transition-colors cursor-pointer text-teal-300 font-medium"
            >
              My Checks ({sessionChecks.length})
            </button>
            <button
              onClick={() => setCurrentTab('howitworks')}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => setCurrentTab('docguard')}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Document Guard
            </button>
            <button
              onClick={() => setCurrentTab('ocr')}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Flyer OCR
            </button>
            <button
              onClick={() => setCurrentTab('lookalike')}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Lookalike Detector
            </button>
            <button
              onClick={() => setCurrentTab('signedads')}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Signed Ads (QR)
            </button>
            <button
              onClick={() => setCurrentTab('recovery')}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Recovery Guide
            </button>
            <button
              onClick={() => setCurrentTab('roadmap')}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Safe Interview Plan
            </button>
            <button
              onClick={() => setCurrentTab('privacy')}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Data Protection Act [12:07]
            </button>
            <button
              onClick={() => setCurrentTab('tests')}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Engine Benchmarks (27 Tests)
            </button>
            <button
              onClick={() => setCurrentTab('threatmodel')}
              className="hover:text-indigo-300 text-indigo-400 font-semibold transition-colors cursor-pointer"
            >
              Threat Model & Evaluation
            </button>
            <button
              onClick={() => setCurrentTab('inclusion')}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              USSD *707# & Inclusion
            </button>
          </div>

          <div className="text-[10px] text-slate-400 text-center md:text-right space-y-0.5">
            <div>Official Employment Protection System • Zero Cleartext Storage under Cyber & Data Protection Act [12:07]</div>
            <div className="text-slate-500 italic">Enterprise entities depicted in demonstration workflows (e.g. Apex Telecom, Crown Commercial Bank) are fictionalized representative models for defensive education.</div>
          </div>
        </div>
      </footer>

      {/* Global Slide-Over My Checks Side-Panel Drawer */}
      <MyChecksPanel
        language={language}
        checks={sessionChecks}
        isDrawer={true}
        isOpen={myChecksDrawerOpen}
        onClose={() => setMyChecksDrawerOpen(false)}
        onOpenReport={handleOpenReport}
        onOpenDocGuard={handleOpenDocGuardWithEmployer}
        onOpenEmployers={() => {
          setCurrentTab('employers');
          setMyChecksDrawerOpen(false);
        }}
        onOpenLookalike={() => {
          setCurrentTab('lookalike');
          setMyChecksDrawerOpen(false);
        }}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
          setMyChecksDrawerOpen(false);
        }}
        onClearChecks={handleClearChecks}
        onDeleteCheck={handleDeleteCheck}
        onAddSampleCheck={handleAddSampleCheck}
      />

      {/* Report Modal */}
      {reportModalOpen && (
        <ReportModal
          language={language}
          prefillIdentifier={reportPrefill}
          onClose={() => setReportModalOpen(false)}
          onSubmitReport={handleAddCommunityReport}
          reportCountThisSession={sessionReportCount}
        />
      )}

      {/* Global Command Palette & Search Modal (Cmd+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigateTab={(tab) => setCurrentTab(tab)}
        onOpenReport={handleOpenReport}
        recentChecks={sessionChecks}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}


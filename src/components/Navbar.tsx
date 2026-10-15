import React, { useState, useEffect } from 'react';
import { Language, AppTab } from '../types';
import { translations } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  FileCheck,
  Building2,
  LifeBuoy,
  HelpCircle,
  Search,
  AlertTriangle,
  Menu,
  X,
  User as UserIcon,
  BadgeCheck,
  ChevronDown,
  Camera,
  Globe,
  QrCode,
  Compass,
  Lock,
  Cpu,
  Users,
  FileText,
  ShieldAlert,
  EyeOff,
} from 'lucide-react';

interface NavbarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  textOnlyMode: boolean;
  setTextOnlyMode: (val: boolean) => void;
  unreadReportsCount?: number;
  checksCount?: number;
  onOpenMyChecks?: () => void;
  onOpenSearch?: () => void;
  onOpenReport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  textOnlyMode,
  setTextOnlyMode,
  checksCount = 0,
  onOpenMyChecks,
  onOpenSearch,
  onOpenReport,
}) => {
  const t = translations[language];
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [verifyDropdownOpen, setVerifyDropdownOpen] = useState(false);
  const [standardsDropdownOpen, setStandardsDropdownOpen] = useState(false);

  // Close menus on resize or navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setVerifyDropdownOpen(false);
    setStandardsDropdownOpen(false);
  }, [currentTab]);

  // Group helpers
  const isVerifyActive = ['chat', 'ocr', 'lookalike', 'docguard', 'signedads'].includes(currentTab);
  const isStandardsActive = ['howitworks', 'privacy', 'inclusion', 'tests'].includes(currentTab);

  const handleNavigate = (tab: AppTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    setVerifyDropdownOpen(false);
    setStandardsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Compliance & Accessibility Ticker */}
      <div className="bg-slate-950 px-4 py-1 text-[11px] text-slate-300 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-semibold">{t.categoryBadge}</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">
              Zero Cleartext Retention • Zimbabwe Cyber & Data Protection Act [12:07]
            </span>
            <span className="hidden md:inline-flex items-center gap-1 bg-emerald-950/90 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <EyeOff className="w-3 h-3 text-emerald-400" />
              <span>Anonymous by Default • No Account Needed</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Low-data text-only mode toggle */}
            <button
              onClick={() => setTextOnlyMode(!textOnlyMode)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                textOnlyMode
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle low-bandwidth mode for rural 2G/3G connections"
            >
              <FileText className="w-3 h-3" />
              <span>{textOnlyMode ? 'Standard Mode' : '2G Text Mode'}</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center bg-slate-800/90 rounded-md p-0.5 border border-slate-700/80">
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('sn')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  language === 'sn'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="ChiShona"
              >
                SN
              </button>
              <button
                onClick={() => setLanguage('nd')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  language === 'nd'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="isiNdebele"
              >
                ND
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={() => handleNavigate('chat')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                {t.appName}
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider hidden xs:inline">
                National Shield
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">
              Defensive Job Verification & Employment Protection
            </p>
          </div>
        </div>

        {/* Primary Desktop Navigation: 5 Strategic HCI Pillars */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* Pillar 1: Verify Jobs Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setVerifyDropdownOpen(!verifyDropdownOpen);
                setStandardsDropdownOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isVerifyActive
                  ? 'bg-emerald-800 text-white ring-1 ring-emerald-500'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify Offer</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {verifyDropdownOpen && (
              <div
                className="absolute left-0 mt-1.5 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn"
                onMouseLeave={() => setVerifyDropdownOpen(false)}
              >
                <button
                  onClick={() => handleNavigate('chat')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'chat' ? 'bg-emerald-900/60 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Text & Voice Analyzer</div>
                    <div className="text-[10px] text-slate-400">Scan messages, recruiter numbers</div>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('ocr')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'ocr' ? 'bg-emerald-900/60 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Camera className="w-4 h-4 text-teal-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Flyer & Screenshot OCR</div>
                    <div className="text-[10px] text-slate-400">Extract contacts from posters</div>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('lookalike')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'lookalike' ? 'bg-emerald-900/60 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Website & Domain Check</div>
                    <div className="text-[10px] text-slate-400">Detect impersonation links</div>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('docguard')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'docguard' ? 'bg-emerald-900/60 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Document Guard</div>
                    <div className="text-[10px] text-slate-400">Watermark ID before sending</div>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('signedads')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'signedads' ? 'bg-emerald-900/60 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Signed QR Vacancy Ads</div>
                    <div className="text-[10px] text-slate-400">Verify employer signature</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Pillar 2: My Checks */}
          <button
            onClick={() => handleNavigate('mychecks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentTab === 'mychecks'
                ? 'bg-teal-700 text-white ring-1 ring-teal-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>{t.navMyChecks}</span>
            {checksCount > 0 && (
              <span className="bg-teal-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {checksCount}
              </span>
            )}
          </button>

          {/* Pillar 3: Verified Employers */}
          <button
            onClick={() => handleNavigate('employers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentTab === 'employers'
                ? 'bg-emerald-800 text-white ring-1 ring-emerald-500'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Employers</span>
          </button>

          {/* Pillar 4: Emergency Incident Recovery */}
          <button
            onClick={() => handleNavigate('recovery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentTab === 'recovery'
                ? 'bg-rose-700 text-white ring-1 ring-rose-400'
                : 'text-rose-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Immediate steps if you sent money or an ID to a fraudulent recruiter"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-rose-400" />
            <span>&quot;I Paid or Shared&quot;</span>
          </button>

          {/* Pillar 5: Standards & Trust Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setStandardsDropdownOpen(!standardsDropdownOpen);
                setVerifyDropdownOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isStandardsActive
                  ? 'bg-slate-800 text-white ring-1 ring-slate-600'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Trust & Standards</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {standardsDropdownOpen && (
              <div
                className="absolute left-0 mt-1.5 w-60 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn"
                onMouseLeave={() => setStandardsDropdownOpen(false)}
              >
                <button
                  onClick={() => handleNavigate('howitworks')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'howitworks' ? 'bg-slate-800 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>How It Works</span>
                </button>
                <button
                  onClick={() => handleNavigate('privacy')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'privacy' ? 'bg-slate-800 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Lock className="w-4 h-4 text-slate-300 shrink-0" />
                  <span>Data Protection Act [12:07]</span>
                </button>
                <button
                  onClick={() => handleNavigate('inclusion')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'inclusion' ? 'bg-slate-800 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Youth & USSD *707#</span>
                </button>
                <button
                  onClick={() => handleNavigate('tests')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'tests' ? 'bg-slate-800 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Engine Benchmarks (27 Tests)</span>
                </button>
                <button
                  onClick={() => handleNavigate('roadmap')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'roadmap' ? 'bg-slate-800 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Safe Interview Plan</span>
                </button>
                <button
                  onClick={() => handleNavigate('threatmodel')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer border-t border-slate-800 ${
                    currentTab === 'threatmodel' ? 'bg-slate-800 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Threat Model & Evaluation</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Global Action Cluster (Search + Report Scam + Account + Mobile Toggle) */}
        <div className="flex items-center gap-2">
          {/* Quick Search Button (Desktop) */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Search tools or employers (Cmd+K)"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Report Scam Action */}
          <button
            onClick={onOpenReport || (() => handleNavigate('report'))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              currentTab === 'report'
                ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-300'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.navReport}</span>
            <span className="sm:hidden">Report</span>
          </button>

          {/* User Account Button */}
          {isAuthenticated && user ? (
            <button
              onClick={() => handleNavigate('account')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs border ${
                currentTab === 'account'
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 ring-2 ring-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              }`}
              title={`Logged in as ${user.name}`}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="max-w-[70px] sm:max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
              {user.isEmailVerified && (
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
            </button>
          ) : (
            <button
              onClick={() => handleNavigate('auth')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border ${
                currentTab === 'auth'
                  ? 'bg-white text-slate-950 font-bold ring-2 ring-white/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              }`}
              title="Sign in with email or Google"
            >
              <UserIcon className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">{t.navSignIn}</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-4 animate-fadeIn">
          {/* Search shortcut for mobile */}
          {onOpenSearch && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
              className="w-full flex items-center justify-between p-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                <span>Search tools or employers...</span>
              </div>
              <span className="text-[10px] text-slate-500">Tap to search</span>
            </button>
          )}

          {/* Verification Tools Section */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Verification Defense Tools
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNavigate('chat')}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  currentTab === 'chat' ? 'bg-emerald-800 text-white' : 'bg-slate-800/80 text-slate-300'
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Text / Voice Analyzer</span>
              </button>
              <button
                onClick={() => handleNavigate('ocr')}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  currentTab === 'ocr' ? 'bg-emerald-800 text-white' : 'bg-slate-800/80 text-slate-300'
                }`}
              >
                <Camera className="w-4 h-4 text-teal-400" />
                <span>Flyer OCR Scan</span>
              </button>
              <button
                onClick={() => handleNavigate('lookalike')}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  currentTab === 'lookalike' ? 'bg-emerald-800 text-white' : 'bg-slate-800/80 text-slate-300'
                }`}
              >
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Website Check</span>
              </button>
              <button
                onClick={() => handleNavigate('docguard')}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  currentTab === 'docguard' ? 'bg-emerald-800 text-white' : 'bg-slate-800/80 text-slate-300'
                }`}
              >
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Watermark ID</span>
              </button>
            </div>
          </div>

          {/* Primary Operations */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Safety & Employment Services
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => handleNavigate('mychecks')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  currentTab === 'mychecks' ? 'bg-teal-800 text-white' : 'bg-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-teal-400" />
                  <span>My Scanned Checks</span>
                </div>
                {checksCount > 0 && (
                  <span className="bg-teal-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {checksCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavigate('employers')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  currentTab === 'employers' ? 'bg-emerald-800 text-white' : 'bg-slate-800/80 text-slate-300'
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Employers Registry</span>
              </button>

              <button
                onClick={() => handleNavigate('recovery')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  currentTab === 'recovery' ? 'bg-rose-800 text-white' : 'bg-rose-950/60 text-rose-300 border border-rose-900/40'
                }`}
              >
                <LifeBuoy className="w-4 h-4 text-rose-400" />
                <span>Emergency: &quot;I Already Paid or Shared&quot;</span>
              </button>
            </div>
          </div>

          {/* Standards & Transparency */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Legal, Trust & Standards
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleNavigate('howitworks')}
                className="p-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-lg text-left"
              >
                How It Works
              </button>
              <button
                onClick={() => handleNavigate('privacy')}
                className="p-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-lg text-left"
              >
                Data Protection Act
              </button>
              <button
                onClick={() => handleNavigate('inclusion')}
                className="p-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-lg text-left"
              >
                Youth & USSD *707#
              </button>
              <button
                onClick={() => handleNavigate('tests')}
                className="p-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-lg text-left"
              >
                27 Engine Tests
              </button>
              <button
                onClick={() => handleNavigate('threatmodel')}
                className="p-2 bg-slate-800/60 hover:bg-slate-800 text-indigo-300 rounded-lg text-left font-semibold col-span-2"
              >
                Threat Model & Evaluation
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

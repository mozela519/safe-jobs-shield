import React, { useState, useEffect, useRef } from 'react';
import { AppTab, SessionCheckItem } from '../types';
import {
  Search,
  Shield,
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
  AlertTriangle,
  ArrowRight,
  Clock,
  Trash2,
  X,
  History,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: AppTab) => void;
  onOpenReport: (prefill?: string) => void;
  recentChecks?: SessionCheckItem[];
}

interface SearchItem {
  id: string;
  title: string;
  category: 'Tools' | 'Employers' | 'Emergency' | 'Standards' | 'Recent Checks';
  description: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

interface SearchHistoryEntry {
  id: string;
  text: string;
  timestamp: number;
}

const SEARCH_HISTORY_STORAGE_KEY = 'safe_jobs_shield_search_history_v1';

const DEFAULT_SEARCH_HISTORY: SearchHistoryEntry[] = [
  { id: 'hist-1', text: 'EcoCash registration fee', timestamp: Date.now() - 1000 * 60 * 15 },
  { id: 'hist-2', text: 'Delta Beverages careers', timestamp: Date.now() - 1000 * 60 * 60 * 2 },
  { id: 'hist-3', text: 'Watermark National ID', timestamp: Date.now() - 1000 * 60 * 60 * 24 },
  { id: 'hist-4', text: 'WhatsApp flyer Harare', timestamp: Date.now() - 1000 * 60 * 60 * 48 },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenReport,
  recentChecks = [],
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search History State
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not read search history from localStorage:', e);
    }
    return DEFAULT_SEARCH_HISTORY;
  });

  const saveHistoryToStorage = (entries: SearchHistoryEntry[]) => {
    try {
      localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(entries));
      setSearchHistory(entries);
    } catch (e) {
      console.warn('Could not save search history to localStorage:', e);
    }
  };

  const addSearchToHistory = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 2) return;

    const filtered = searchHistory.filter(
      (item) => item.text.toLowerCase() !== trimmed.toLowerCase()
    );
    const newEntry: SearchHistoryEntry = {
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      text: trimmed,
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...filtered].slice(0, 8); // Keep top 8 searches
    saveHistoryToStorage(updated);
  };

  const removeSearchHistoryItem = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = searchHistory.filter((item) => item.id !== id);
    saveHistoryToStorage(updated);
  };

  const clearAllSearchHistory = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    saveHistoryToStorage([]);
  };

  const STATIC_ITEMS: SearchItem[] = [
    {
      id: 'verify-text',
      title: 'Analyze Job Offer (Text / Voice)',
      category: 'Tools',
      description: 'Check WhatsApp message, SMS, recruiter number, or job post for 12 scam indicators',
      icon: <Shield className="w-4 h-4 text-emerald-600" />,
      action: () => {
        addSearchToHistory('Analyze Job Offer');
        onNavigateTab('chat');
        onClose();
      },
      keywords: ['chat', 'voice', 'whatsapp', 'sms', 'text', 'ecocash', 'fee', 'recruiter', 'salary'],
    },
    {
      id: 'verify-ocr',
      title: 'Flyer & Screenshot OCR Scanner',
      category: 'Tools',
      description: 'Upload job advert images, newspaper clippings, or social media posters',
      icon: <Camera className="w-4 h-4 text-teal-600" />,
      action: () => {
        addSearchToHistory('Flyer OCR Scanner');
        onNavigateTab('ocr');
        onClose();
      },
      keywords: ['ocr', 'image', 'photo', 'screenshot', 'poster', 'flyer', 'scan', 'camera'],
    },
    {
      id: 'verify-lookalike',
      title: 'Lookalike Website & Domain Detector',
      category: 'Tools',
      description: 'Check if a company portal link is an impersonation phishing scam',
      icon: <Globe className="w-4 h-4 text-amber-600" />,
      action: () => {
        addSearchToHistory('Lookalike Website Detector');
        onNavigateTab('lookalike');
        onClose();
      },
      keywords: ['website', 'domain', 'url', 'link', 'spoof', 'phishing', 'lookalike'],
    },
    {
      id: 'verify-docguard',
      title: 'Document Guard (ID Watermarking)',
      category: 'Tools',
      description: 'Apply protective tamper-evident watermarks to your ID card before sending',
      icon: <FileCheck className="w-4 h-4 text-emerald-600" />,
      action: () => {
        addSearchToHistory('Document Guard Watermarking');
        onNavigateTab('docguard');
        onClose();
      },
      keywords: ['document', 'id', 'watermark', 'cv', 'national id', 'passport', 'protect', 'identity'],
    },
    {
      id: 'verify-qr',
      title: 'Verify Signed QR Vacancy Ads',
      category: 'Tools',
      description: 'Scan signed QR codes from certified Zimbabwean employers',
      icon: <QrCode className="w-4 h-4 text-emerald-600" />,
      action: () => {
        addSearchToHistory('Verify Signed QR Ads');
        onNavigateTab('signedads');
        onClose();
      },
      keywords: ['qr', 'signed', 'certificate', 'signature', 'official', 'employer qr'],
    },
    {
      id: 'my-checks',
      title: 'My Verification Records ("My Checks")',
      category: 'Tools',
      description: 'Review session history of scanned phone numbers, links, and guarded files',
      icon: <FileText className="w-4 h-4 text-teal-600" />,
      action: () => {
        addSearchToHistory('My Checks');
        onNavigateTab('mychecks');
        onClose();
      },
      keywords: ['my checks', 'history', 'saved', 'session', 'audit', 'records'],
    },
    {
      id: 'emergency-recovery',
      title: '"I Already Paid or Shared" (Emergency Response)',
      category: 'Emergency',
      description: 'Immediate action steps to reverse mobile money and prevent identity theft',
      icon: <LifeBuoy className="w-4 h-4 text-rose-600" />,
      action: () => {
        addSearchToHistory('Emergency Recovery');
        onNavigateTab('recovery');
        onClose();
      },
      keywords: ['recovery', 'paid', 'shared', 'scammed', 'police', 'ecocash reversal', 'emergency', 'help'],
    },
    {
      id: 'report-scam',
      title: 'Report a Scam to National Registry',
      category: 'Emergency',
      description: 'Submit fraudulent phone number or fake recruiter email anonymously',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      action: () => {
        addSearchToHistory('Report Scam');
        onOpenReport();
        onClose();
      },
      keywords: ['report', 'flag', 'scam', 'fraud', 'submit', 'community', 'anonymized'],
    },
    {
      id: 'emp-zambezi',
      title: 'Zambezi Breweries & Bottling Ltd (Fictional Model)',
      category: 'Employers',
      description: 'Fictional employer model • Free applications via official recruitment portal',
      icon: <Building2 className="w-4 h-4 text-emerald-600" />,
      action: () => {
        addSearchToHistory('Zambezi Breweries');
        onNavigateTab('employers');
        onClose();
      },
      keywords: ['zambezi', 'breweries', 'bottlers', 'beverages', 'jobs', 'harare', 'bulawayo'],
    },
    {
      id: 'emp-ecotel',
      title: 'EcoTel Communications Zimbabwe (Fictional Model)',
      category: 'Employers',
      description: 'Fictional telecom model • Zero application fee policy strictly enforced',
      icon: <Building2 className="w-4 h-4 text-emerald-600" />,
      action: () => {
        addSearchToHistory('EcoTel Communications');
        onNavigateTab('employers');
        onClose();
      },
      keywords: ['ecotel', 'telecom', 'wireless', 'jobs', 'airtime', 'network'],
    },
    {
      id: 'emp-greatdyke',
      title: 'Great Dyke Minerals & Mining (Fictional Model)',
      category: 'Employers',
      description: 'Fictional mining model • Technical apprenticeships and safety-first onboarding',
      icon: <Building2 className="w-4 h-4 text-emerald-600" />,
      action: () => {
        addSearchToHistory('Great Dyke Mining');
        onNavigateTab('employers');
        onClose();
      },
      keywords: ['great dyke', 'mining', 'minerals', 'engineering', 'mineworks'],
    },
    {
      id: 'standards-act',
      title: 'Zimbabwe Cyber & Data Protection Act [12:07]',
      category: 'Standards',
      description: 'Review statutory compliance, zero cleartext retention, and citizen data rights',
      icon: <Lock className="w-4 h-4 text-slate-700" />,
      action: () => {
        addSearchToHistory('Cyber Data Protection Act');
        onNavigateTab('privacy');
        onClose();
      },
      keywords: ['privacy', 'cyber act', 'law', 'data protection', '12:07', 'potraz', 'consent'],
    },
    {
      id: 'standards-tests',
      title: 'Algorithm Benchmarks (27 Unit Tests)',
      category: 'Standards',
      description: 'Transparent execution results on real-world Zimbabwean scam test cases',
      icon: <Cpu className="w-4 h-4 text-cyan-600" />,
      action: () => {
        addSearchToHistory('Engine Tests');
        onNavigateTab('tests');
        onClose();
      },
      keywords: ['tests', 'benchmarks', 'algorithm', 'rules', 'unit tests', 'accuracy'],
    },
    {
      id: 'standards-threatmodel',
      title: 'Threat Model & Technical Evaluation',
      category: 'Standards',
      description: 'STRIDE vulnerability analysis, trust boundaries, and employer KMS specifications',
      icon: <ShieldAlert className="w-4 h-4 text-indigo-600" />,
      action: () => {
        addSearchToHistory('Threat Model & Evaluation');
        onNavigateTab('threatmodel');
        onClose();
      },
      keywords: ['threat', 'stride', 'evaluation', 'security', 'kms', 'vetting', 'model', 'attacks', 'audit'],
    },
    {
      id: 'standards-inclusion',
      title: 'Youth & Rural Inclusion (USSD *707#)',
      category: 'Standards',
      description: 'Offline low-data channels and gender-inclusive job protection in Zimbabwe',
      icon: <Users className="w-4 h-4 text-purple-600" />,
      action: () => {
        addSearchToHistory('USSD 707 Inclusion');
        onNavigateTab('inclusion');
        onClose();
      },
      keywords: ['ussd', 'inclusion', 'rural', 'youth', 'gender', 'offline', '707'],
    },
  ];

  // Convert recent session checks into searchable items
  const checkItems: SearchItem[] = recentChecks.slice(0, 6).map((check) => ({
    id: `check-${check.id}`,
    title: check.title,
    category: 'Recent Checks',
    description: `${check.verdict.replace('_', ' ')} • ${check.snippet.substring(0, 65)}...`,
    icon: (
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
          check.verdict === 'HIGH_RISK'
            ? 'bg-rose-100 text-rose-700'
            : check.verdict === 'SUSPICIOUS'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-emerald-100 text-emerald-700'
        }`}
      >
        ✓
      </div>
    ),
    action: () => {
      addSearchToHistory(check.title);
      onNavigateTab('mychecks');
      onClose();
    },
    keywords: [
      check.title,
      check.verdict,
      check.type,
      ...check.identifiers.map((i) => i.value),
    ],
  }));

  const allSearchableItems = [...checkItems, ...STATIC_ITEMS];

  // Filter items based on active query
  const filteredItems = allSearchableItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      } else if (query.trim()) {
        addSearchToHistory(query.trim());
        onNavigateTab('chat');
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelectHistoryItem = (historyText: string) => {
    setQuery(historyText);
    addSearchToHistory(historyText);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 pt-14 sm:pt-20 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, employers, recent checks, or enter query..."
            className="w-full bg-transparent text-sm text-slate-900 focus:outline-none placeholder:text-slate-400"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              title="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline bg-slate-200 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600 font-semibold">
              ESC
            </kbd>
          )}
        </div>

        {/* Search History Chips Section (Displayed prominently when query is empty or partially typed) */}
        {!query && searchHistory.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Recent Searches</span>
              </span>
              <button
                onClick={clearAllSearchHistory}
                className="text-[10px] text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear recent search history"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {searchHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectHistoryItem(item.text)}
                  className="group flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 rounded-lg text-xs border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs"
                >
                  <Clock className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                  <span className="font-medium truncate max-w-[150px]">{item.text}</span>
                  <button
                    onClick={(e) => removeSearchHistoryItem(item.id, e)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                    title="Remove from history"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs space-y-2">
              <p className="font-semibold text-slate-700">No direct tools or employers found for &quot;{query}&quot;.</p>
              <p className="text-slate-400">Press <strong>Enter</strong> to evaluate this query in the Text Analyzer.</p>
              <button
                onClick={() => {
                  addSearchToHistory(query);
                  onNavigateTab('chat');
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                <span>Analyze &quot;{query}&quot; in Verification Bot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white shadow-xs' : 'bg-slate-100'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm truncate">{item.title}</span>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                          · {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-emerald-700 translate-x-1' : 'text-slate-300'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-300">↑</kbd>{' '}
              <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-300">↓</kbd> navigate
            </span>
            <span>
              <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-300">↵</kbd> select
            </span>
            <span>
              <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-300">ESC</kbd> close
            </span>
          </div>
          <span className="text-emerald-700 font-medium">Safe Jobs Shield Search History</span>
        </div>
      </div>
    </div>
  );
};

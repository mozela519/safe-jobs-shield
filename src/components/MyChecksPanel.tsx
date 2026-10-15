import React, { useState, useMemo } from 'react';
import {
  Language,
  SessionCheckItem,
  CheckType,
  SessionCheckVerdict,
} from '../types';
import { translations } from '../i18n/translations';
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  Camera,
  QrCode,
  Globe,
  MessageSquare,
  Search,
  Trash2,
  Download,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';

interface MyChecksPanelProps {
  language: Language;
  checks: SessionCheckItem[];
  isOpen?: boolean; // For drawer mode
  onClose?: () => void; // For drawer mode
  isDrawer?: boolean; // True if rendered as side drawer, false if full page view
  onOpenReport?: (prefillIdentifier?: string) => void;
  onOpenDocGuard?: (prefillEmployer?: string) => void;
  onOpenEmployers?: () => void;
  onOpenLookalike?: () => void;
  onNavigateTab?: (tab: any) => void;
  onClearChecks: () => void;
  onDeleteCheck: (id: string) => void;
  onAddSampleCheck?: () => void;
}

export const MyChecksPanel: React.FC<MyChecksPanelProps> = ({
  language,
  checks,
  isOpen = true,
  onClose,
  isDrawer = false,
  onOpenReport,
  onOpenDocGuard,
  onOpenEmployers,
  onOpenLookalike,
  onNavigateTab,
  onClearChecks,
  onDeleteCheck,
  onAddSampleCheck,
}) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<CheckType | 'all'>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [expandedCheckId, setExpandedCheckId] = useState<string | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Keyboard escape listener to close drawer
  React.useEffect(() => {
    if (!isDrawer || !isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawer, isOpen, onClose]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(label);
    setTimeout(() => {
      setCopiedValue(null);
    }, 2000);
  };

  // Copy all extracted identifiers in the session
  const handleCopyAllIdentifiers = () => {
    const lines: string[] = [];
    checks.forEach((item) => {
      item.identifiers.forEach((ident) => {
        lines.push(`${ident.type.toUpperCase()}: ${ident.value} (${item.title})`);
      });
    });
    if (lines.length === 0) return;
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Export session checks as a text file for jobseeker offline records
  const handleExportSession = () => {
    const dateStr = new Date().toLocaleDateString();
    let content = `SAFE JOBS SHIELD - SESSION AUDIT REPORT\n`;
    content += `Generated: ${new Date().toISOString()} (${dateStr})\n`;
    content += `Privacy Standard: Zimbabwe Cyber & Data Protection Act [Chapter 12:07]\n`;
    content += `=================================================================\n\n`;

    content += `SESSION SUMMARY:\n`;
    content += `- Total items audited: ${checks.length}\n`;
    content += `- Flagged High Risk / Suspicious: ${
      checks.filter((c) => c.verdict === 'HIGH_RISK' || c.verdict === 'SUSPICIOUS').length
    }\n`;
    content += `- Verified Safe / Valid: ${
      checks.filter((c) => c.verdict === 'LOW_RISK' || c.verdict === 'VERIFIED_VALID').length
    }\n`;
    content += `- Protected Documents: ${
      checks.filter((c) => c.verdict === 'DOCUMENT_GUARDED').length
    }\n\n`;
    content += `=================================================================\n\n`;

    checks.forEach((chk, index) => {
      content += `[ITEM #${index + 1}] ${chk.title.toUpperCase()}\n`;
      content += `Type: ${chk.type}\n`;
      content += `Time: ${new Date(chk.timestamp).toLocaleString()}\n`;
      content += `Verdict: ${chk.verdict} (Risk Score: ${chk.riskScore ?? 'N/A'}/100)\n`;
      content += `Snippet: ${chk.snippet}\n`;
      content += `Identified Entities:\n`;
      if (chk.identifiers.length === 0) {
        content += `  (No explicit phone/domain identifiers detected)\n`;
      } else {
        chk.identifiers.forEach((ident) => {
          content += `  - ${ident.type.toUpperCase()}: ${ident.value} ${ident.label ? `[${ident.label}]` : ''}\n`;
        });
      }
      content += `-----------------------------------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SafeJobsShield_Session_Checks_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered checks list
  const filteredChecks = useMemo(() => {
    return checks.filter((c) => {
      // Type filter
      if (selectedType !== 'all' && c.type !== selectedType) return false;

      // Risk filter
      if (selectedRisk === 'high_suspicious') {
        if (c.verdict !== 'HIGH_RISK' && c.verdict !== 'SUSPICIOUS' && c.verdict !== 'VERIFIED_TAMPERED') {
          return false;
        }
      } else if (selectedRisk === 'safe_valid') {
        if (c.verdict !== 'LOW_RISK' && c.verdict !== 'VERIFIED_VALID') return false;
      } else if (selectedRisk === 'guarded') {
        if (c.verdict !== 'DOCUMENT_GUARDED') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = c.title.toLowerCase().includes(q);
        const inSnippet = c.snippet.toLowerCase().includes(q);
        const inIdentifiers = c.identifiers.some(
          (i) => i.value.toLowerCase().includes(q) || (i.label && i.label.toLowerCase().includes(q))
        );
        const inMetadata =
          c.metadata?.employerName?.toLowerCase().includes(q) ||
          c.metadata?.jobTitle?.toLowerCase().includes(q) ||
          c.metadata?.purpose?.toLowerCase().includes(q);

        if (!inTitle && !inSnippet && !inIdentifiers && !inMetadata) {
          return false;
        }
      }

      return true;
    });
  }, [checks, selectedType, selectedRisk, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = checks.length;
    const highRisk = checks.filter(
      (c) => c.verdict === 'HIGH_RISK' || c.verdict === 'SUSPICIOUS' || c.verdict === 'VERIFIED_TAMPERED'
    ).length;
    const verified = checks.filter(
      (c) => c.verdict === 'LOW_RISK' || c.verdict === 'VERIFIED_VALID'
    ).length;
    const guarded = checks.filter((c) => c.verdict === 'DOCUMENT_GUARDED').length;
    const uniqueIdentifiers = new Set<string>();
    checks.forEach((c) => {
      c.identifiers.forEach((i) => uniqueIdentifiers.add(i.value));
    });

    return {
      total,
      highRisk,
      verified,
      guarded,
      uniqueCount: uniqueIdentifiers.size,
    };
  }, [checks]);

  const renderTypeIcon = (type: CheckType) => {
    switch (type) {
      case 'chat_job':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'ocr_flyer':
        return <Camera className="w-4 h-4 text-teal-600" />;
      case 'signed_ad_qr':
        return <QrCode className="w-4 h-4 text-emerald-700" />;
      case 'guarded_document':
        return <FileCheck className="w-4 h-4 text-cyan-600" />;
      case 'lookalike_domain':
        return <Globe className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const renderTypeLabel = (type: CheckType) => {
    switch (type) {
      case 'chat_job':
        return 'Job Text Check';
      case 'ocr_flyer':
        return 'Poster / Flyer OCR';
      case 'signed_ad_qr':
        return 'Signed Ad (QR)';
      case 'guarded_document':
        return 'Guarded Document';
      case 'lookalike_domain':
        return 'Domain Verification';
      default:
        return 'Audit Check';
    }
  };

  const renderVerdictBadge = (verdict: SessionCheckVerdict, score?: number) => {
    switch (verdict) {
      case 'HIGH_RISK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            HIGH RISK {score !== undefined ? `(${score}%)` : ''}
          </span>
        );
      case 'SUSPICIOUS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            SUSPICIOUS {score !== undefined ? `(${score}%)` : ''}
          </span>
        );
      case 'VERIFIED_TAMPERED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-400">
            <AlertTriangle className="w-3 h-3 text-rose-700" />
            TAMPERED SIGNATURE
          </span>
        );
      case 'VERIFIED_VALID':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            CRYPTOGRAPHICALLY SIGNED
          </span>
        );
      case 'DOCUMENT_GUARDED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
            <FileCheck className="w-3 h-3 text-teal-600" />
            WATERMARKED & PROTECTED
          </span>
        );
      case 'LOW_RISK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            LOW RISK {score !== undefined ? `(${score}%)` : ''}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            CHECKED
          </span>
        );
    }
  };

  const formatTimestamp = (time: number) => {
    const diffSec = Math.floor((Date.now() - time) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Main list content
  const content = (
    <div className="flex flex-col h-full space-y-4">
      {/* Zero Message Content & Anonymous Default Guarantee */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-emerald-950 space-y-0.5">
          <strong className="font-bold">Zero-Storage Guarantee:</strong>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Your checks are stored locally in your browser session. If you choose to link an optional citizen account, only zero-knowledge check hashes are synchronized. <strong>Our servers never store message text, recruiter transcripts, or raw phone numbers.</strong>
          </p>
        </div>
      </div>

      {/* Session Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <span className="block text-2xl font-black text-slate-800">
            {stats.total}
          </span>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Total Checks
          </span>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
          <span className="block text-2xl font-black text-rose-700">
            {stats.highRisk}
          </span>
          <span className="text-[11px] font-medium text-rose-600 uppercase tracking-wider">
            Scams / High Risk
          </span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <span className="block text-2xl font-black text-emerald-700">
            {stats.verified}
          </span>
          <span className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">
            Safe / Verified
          </span>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-center">
          <span className="block text-2xl font-black text-teal-700">
            {stats.guarded}
          </span>
          <span className="text-[11px] font-medium text-teal-600 uppercase tracking-wider">
            Guarded IDs
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phone number (+263...), domain, employer or keyword..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400 text-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category & Risk Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Type Filters */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              All Types ({checks.length})
            </button>
            <button
              onClick={() => setSelectedType('chat_job')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                selectedType === 'chat_job'
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              Chat Checks
            </button>
            <button
              onClick={() => setSelectedType('ocr_flyer')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                selectedType === 'ocr_flyer'
                  ? 'bg-teal-700 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Camera className="w-3 h-3" />
              Flyers (OCR)
            </button>
            <button
              onClick={() => setSelectedType('signed_ad_qr')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                selectedType === 'signed_ad_qr'
                  ? 'bg-emerald-800 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <QrCode className="w-3 h-3" />
              Signed Ads
            </button>
            <button
              onClick={() => setSelectedType('guarded_document')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                selectedType === 'guarded_document'
                  ? 'bg-cyan-800 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <FileCheck className="w-3 h-3" />
              Guarded IDs
            </button>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="text-[11px] bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Risk Levels</option>
              <option value="high_suspicious">High Risk / Suspicious Only</option>
              <option value="safe_valid">Safe & Verified Only</option>
              <option value="guarded">Guarded Documents Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Toolbar: Export, Copy All, Clear */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Showing <strong className="text-slate-800">{filteredChecks.length}</strong> of {checks.length} items</span>
          <span>•</span>
          <span className="text-emerald-700 font-medium">
            {stats.uniqueCount} unique identifiers tracked
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyAllIdentifiers}
            disabled={checks.length === 0}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
            title="Copy all extracted phone numbers and links from this session"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'Copied All!' : 'Copy Identifiers'}</span>
          </button>

          <button
            onClick={handleExportSession}
            disabled={checks.length === 0}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
            title="Download formatted text report of this session for your offline job records"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <button
            onClick={() => setConfirmClearOpen(true)}
            disabled={checks.length === 0}
            className="px-2 py-1 text-xs font-semibold rounded-lg text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
            title="Clear all session history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Prompt */}
      {confirmClearOpen && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Clear all checks from current session memory?</span>
          </div>
          <p className="text-[11px] text-rose-700">
            This will wipe the current session audit log. Your data is not stored on any remote server.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                onClearChecks();
                setConfirmClearOpen(false);
              }}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold cursor-pointer"
            >
              Yes, Clear All
            </button>
            <button
              onClick={() => setConfirmClearOpen(false)}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredChecks.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/60 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            No matching checks found
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {searchQuery || selectedType !== 'all' || selectedRisk !== 'all'
              ? 'Try adjusting your search terms or filters to see your scanned items.'
              : 'You have not scanned any offers or documents in this session yet.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {onNavigateTab && (
              <>
                <button
                  onClick={() => onNavigateTab('chat')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Verify a Job in Chat
                </button>
                <button
                  onClick={() => onNavigateTab('ocr')}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Scan Flyer (OCR)
                </button>
                <button
                  onClick={() => onNavigateTab('docguard')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Watermark ID
                </button>
              </>
            )}
            {onAddSampleCheck && (
              <button
                onClick={onAddSampleCheck}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Load Sample Checks
              </button>
            )}
          </div>
        </div>
      )}

      {/* List of Checks */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredChecks.map((check) => {
          const isExpanded = expandedCheckId === check.id;

          return (
            <div
              key={check.id}
              className={`bg-white rounded-xl border transition-all ${
                check.verdict === 'HIGH_RISK' || check.verdict === 'VERIFIED_TAMPERED'
                  ? 'border-rose-200/90 hover:border-rose-300 shadow-xs'
                  : check.verdict === 'SUSPICIOUS'
                  ? 'border-amber-200/90 hover:border-amber-300 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Card Header */}
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-slate-100">
                      {renderTypeIcon(check.type)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          {renderTypeLabel(check.type)}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(check.timestamp)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {check.title}
                      </h4>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {renderVerdictBadge(check.verdict, check.riskScore)}
                    <button
                      onClick={() => onDeleteCheck(check.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Remove from session list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed bg-slate-50/80 p-2 rounded-lg border border-slate-100 font-mono text-[11px]">
                  &ldquo;{check.snippet}&rdquo;
                </p>

                {/* Extracted Identifiers Bar */}
                {check.identifiers.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Detected Job Identifiers:</span>
                      <span className="text-slate-400 font-normal">Click to copy or report</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {check.identifiers.map((ident, i) => {
                        const copyLabel = `${check.id}-${i}-${ident.value}`;
                        const isCopied = copiedValue === copyLabel;

                        return (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-[11px] px-2 py-1 rounded-md border border-slate-200 transition-colors"
                          >
                            <span className="font-semibold text-slate-500 uppercase text-[9px]">
                              {ident.type}:
                            </span>
                            <span className="font-mono text-slate-900 font-medium">
                              {ident.value}
                            </span>

                            <button
                              onClick={() => handleCopy(ident.value, copyLabel)}
                              className="text-slate-400 hover:text-emerald-700 ml-0.5 cursor-pointer"
                              title="Copy value"
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>

                            {/* Quick report button if phone or domain */}
                            {(ident.type === 'phone' || ident.type === 'domain') && onOpenReport && (
                              <button
                                onClick={() => onOpenReport(ident.value)}
                                className="text-amber-600 hover:text-amber-800 ml-0.5 cursor-pointer"
                                title="Report this identifier to Community Desk"
                              >
                                <AlertTriangle className="w-3 h-3" />
                              </button>
                            )}

                            {/* Quick Lookalike check if domain */}
                            {ident.type === 'domain' && onOpenLookalike && (
                              <button
                                onClick={onOpenLookalike}
                                className="text-blue-600 hover:text-blue-800 ml-0.5 cursor-pointer"
                                title="Check official domain in Lookalike Detector"
                              >
                                <Globe className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setExpandedCheckId(isExpanded ? null : check.id)}
                    className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        <span>Hide Details</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>View Audit Breakdown</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Watermark ID Shortcut if an employer was identified */}
                    {check.metadata?.employerName && onOpenDocGuard && (
                      <button
                        onClick={() => onOpenDocGuard(check.metadata?.employerName)}
                        className="text-[11px] font-semibold px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded border border-teal-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title={`Watermark your ID specifically for ${check.metadata.employerName}`}
                      >
                        <FileCheck className="w-3 h-3 text-teal-600" />
                        <span>Watermark ID for {check.metadata.employerName.split(' ')[0]}</span>
                      </button>
                    )}

                    {/* Report Scam Action if high risk or suspicious */}
                    {(check.verdict === 'HIGH_RISK' ||
                      check.verdict === 'SUSPICIOUS' ||
                      check.verdict === 'VERIFIED_TAMPERED') &&
                      onOpenReport && (
                        <button
                          onClick={() => {
                            const firstIdent = check.identifiers.find(
                              (i) => i.type === 'phone' || i.type === 'domain'
                            );
                            onOpenReport(firstIdent ? firstIdent.value : check.title);
                          }}
                          className="text-[11px] font-bold px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded border border-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Report Scam</span>
                        </button>
                      )}

                    {/* Check Official Registry */}
                    {check.metadata?.employerName && onOpenEmployers && (
                      <button
                        onClick={onOpenEmployers}
                        className="text-[11px] font-medium px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Check Registry</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2 animate-fadeIn">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Audit Verification Metadata</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500">Check ID:</span>{' '}
                        <code className="text-slate-800 bg-white px-1 py-0.5 rounded border border-slate-200 font-mono text-[10px]">
                          {check.id}
                        </code>
                      </div>
                      <div>
                        <span className="text-slate-500">Audit Time:</span>{' '}
                        <span className="text-slate-800 font-medium">
                          {new Date(check.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {check.riskScore !== undefined && (
                        <div>
                          <span className="text-slate-500">Risk Score:</span>{' '}
                          <span className="text-slate-900 font-bold">
                            {check.riskScore} / 100
                          </span>
                        </div>
                      )}
                      {check.metadata?.matchedSignalsCount !== undefined && (
                        <div>
                          <span className="text-slate-500">Signals Triggered:</span>{' '}
                          <span className="text-slate-900 font-bold">
                            {check.metadata.matchedSignalsCount} signals
                          </span>
                        </div>
                      )}
                      {check.metadata?.verificationSignatureHex && (
                        <div className="sm:col-span-2">
                          <span className="text-slate-500">Digital Signature:</span>{' '}
                          <code className="block mt-0.5 text-[10px] bg-white p-1 rounded border border-slate-200 text-slate-700 break-all font-mono">
                            {check.metadata.verificationSignatureHex}
                          </code>
                        </div>
                      )}
                    </div>

                    {check.rawResult && check.rawResult.signals.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/80">
                        <span className="font-semibold text-slate-700 block mb-1">
                          Detected Risk Red Flags:
                        </span>
                        <ul className="space-y-1">
                          {check.rawResult.signals.map((sig, sIdx) => (
                            <li
                              key={sIdx}
                              className="text-[11px] text-rose-800 bg-rose-50/80 p-1.5 rounded border border-rose-100 flex items-start gap-1.5"
                            >
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                              <span>{sig.label.en}: {sig.description.en}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-2 text-[10px] text-slate-500 italic">
                      Zero server retention: This verification was processed entirely in memory or client-side under Chapter 12:07 rules.
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Zero Data Leak Privacy Footer Note */}
      <div className="p-3 bg-emerald-950 text-emerald-200 rounded-xl text-[11px] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Chapter 12:07 Compliance:</strong> Session checks stay in your browser tab only and are automatically erased when you close this window.
          </span>
        </div>
      </div>
    </div>
  );

  // If rendered as Side-Panel Drawer
  if (isDrawer) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-over Container */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
          <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slideLeft">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between border-b border-emerald-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                      My Session Checks
                    </h3>
                    <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                      {checks.length} Audited
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/80">
                    Live history of verified job offers, flyers, and guarded documents
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {onNavigateTab && (
                  <button
                    onClick={() => {
                      onNavigateTab('mychecks');
                      onClose?.();
                    }}
                    className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Expand into full page view"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Close panel (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full-page View
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                <FileCheck className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
                Session Audit Log & Job Tracker
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              My Checks: Scanned Identifiers & Guarded Documents
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-2xl leading-relaxed">
              Live audit history of every phone number (+263...), website link, WhatsApp flyer, cryptographic job signature, and watermarked ID checked during this browser session. Zero cleartext server storage (Zimbabwe Cyber & Data Protection Act [Chapter 12:07] compliant).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportSession}
              disabled={checks.length === 0}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>Export Session Log</span>
            </button>
            {onAddSampleCheck && (
              <button
                onClick={onAddSampleCheck}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Add Sample</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 min-h-[500px]">
        {content}
      </div>
    </div>
  );
};

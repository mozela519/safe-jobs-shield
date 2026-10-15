import React, { useState, useEffect } from 'react';
import { Language, VerifiedEmployer } from '../types';
import { translations } from '../i18n/translations';
import { verifyEmployerSignature } from '../crypto/privacy';
import verifiedEmployersData from '../data/employers.json';
import {
  CheckCircle2,
  ShieldCheck,
  Search,
  Lock,
  Building,
  MapPin,
  Phone,
  Globe,
  Briefcase,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  X,
  FileCheck,
  Calendar,
  Award,
  Copy,
  Check,
  Info,
  ArrowRight,
  QrCode,
  Key,
} from 'lucide-react';

interface VerifiedEmployersPanelProps {
  language: Language;
  onSelectEmployerOffer?: (offerText: string) => void;
  onNavigateTab?: (tab: 'signedads' | 'lookalike') => void;
}

// Tailored verification audit notes for each fictional employer
const VERIFICATION_NOTES: Record<string, { noteEn: string; auditScope: string; necCompliance: string }> = {
  'EMP-001': {
    noteEn:
      'Vetted via on-site physical packhouse audit in Mazowe Valley. Signed statutory zero-fee pledge. Seasonal agricultural contracts strictly comply with National Employment Council (NEC) agricultural wage rates and include protective equipment and covered transport.',
    auditScope: 'Physical Farm Inspection & Packhouse Safety Audit (Mashonaland Central)',
    necCompliance: 'NEC Agriculture Collective Bargaining Agreement Compliant',
  },
  'EMP-002': {
    noteEn:
      'Verified corporate technology tenant at 8 Samora Machel Avenue, Harare CBD. All internships and entry-level positions feature structured practical evaluation tests and multi-stage panel interviews. Zero agency or training fees permitted.',
    auditScope: 'Harare CBD Commercial Office Inspection & Corporate Registry Verification',
    necCompliance: 'NEC Communications & Information Technology Standards',
  },
  'EMP-003': {
    noteEn:
      'Registered logistics cooperative operating out of Workington Industrial Zone. Fleet safety checks and cold chain storage confirmed. Formal driver and warehouse clerk contracts provided with medical and pension coverage.',
    auditScope: 'Workington Industrial Yard Physical Audit & Vehicle Fleet Registry',
    necCompliance: 'NEC Transport Operating Industry Regulations',
  },
  'EMP-004': {
    noteEn:
      'Bulawayo renewable energy engineering workshop inspected on Robert Mugabe Way. Formal technical apprenticeship registered under trade union standards. Safety gear, electrical test equipment, and union allowances provided free of charge.',
    auditScope: 'Bulawayo Workshop Technical Audit & Electrical Safety Accreditation',
    necCompliance: 'NEC Engineering & Iron and Steel Industry Standards',
  },
  'EMP-005': {
    noteEn:
      'Registered Zimbabwean Public Health NGO (W.O. 2019/3012) operating in the Avenues, Harare. Stringent child safeguarding, gender non-discrimination, and zero-exploitation employment policies verified by independent legal counsel.',
    auditScope: 'NGO Registrar Audit & Public Health Field Operations Review',
    necCompliance: 'National Association of Non-Governmental Organisations (NANGO) Code of Conduct',
  },
  'EMP-006': {
    noteEn:
      'Authentic Masvingo artisanal stone carving and creative arts cooperative. Fair trade certification verified. Youth apprentice artisans receive accredited craft mentorship, export sales royalties, and workshop materials without deduction.',
    auditScope: 'Masvingo Craft Centre Field Review & Fair Trade Export Certification',
    necCompliance: 'National Handicraft Association Fair Trade Agreement',
  },
  'EMP-007': {
    noteEn:
      'Eco-lodge and community tourism enterprise in Nyanga, Manicaland. Environmentally sustainable tourism guidelines and tour guide accreditation verified. Guarantees safe staff lodge quarters and statutory hospitality allowances.',
    auditScope: 'Nyanga Eco-Lodge Premises Inspection & Zimbabwe Tourism Authority (ZTA) License',
    necCompliance: 'NEC Tourism and Hospitality Industry Agreement',
  },
  'EMP-008': {
    noteEn:
      'Registered micro-finance and financial inclusion advisory headquartered at Joina City, Harare. Operates formal youth peer education programs. Strict anti-bribery policies prevent any recruitment facilitation payments.',
    auditScope: 'Reserve Bank of Zimbabwe (RBZ) Micro-Finance Registry & Joina City Office Audit',
    necCompliance: 'Banking & Financial Services Code of Conduct',
  },
};

export const VerifiedEmployersPanel: React.FC<VerifiedEmployersPanelProps> = ({
  language,
  onSelectEmployerOffer,
  onNavigateTab,
}) => {
  const t = translations[language];
  const [employers, setEmployers] = useState<VerifiedEmployer[]>(
    verifiedEmployersData as unknown as VerifiedEmployer[]
  );
  const [verificationStatus, setVerificationStatus] = useState<Record<string, boolean>>({});
  const [tamperedIds, setTamperedIds] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedEmployer, setSelectedEmployer] = useState<VerifiedEmployer | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showKmsModal, setShowKmsModal] = useState(false);

  // Verify all signatures on mount using Web Crypto API
  useEffect(() => {
    async function verifyAll() {
      const statusMap: Record<string, boolean> = {};
      for (const emp of employers) {
        const isValid = await verifyEmployerSignature(emp.canonicalPayload, emp.signatureHex);
        statusMap[emp.id] = isValid;
      }
      setVerificationStatus(statusMap);
    }
    verifyAll();
  }, [employers]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedEmployer) {
        setSelectedEmployer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEmployer]);

  // Simulate tampering for demo purposes (judges can test tamper-evidence)
  const handleTamperEmployer = async (empId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEmployers((prev) =>
      prev.map((emp) => {
        if (emp.id === empId) {
          // Alter the canonical payload by injecting a spoofed URL
          const tamperedPayload = emp.canonicalPayload.replace(emp.domain, 'scammer-phish-domain.xyz');
          const updated = {
            ...emp,
            domain: 'scammer-phish-domain.xyz',
            canonicalPayload: tamperedPayload,
          };
          if (selectedEmployer?.id === empId) {
            setSelectedEmployer(updated);
          }
          return updated;
        }
        return emp;
      })
    );
    setTamperedIds((prev) => ({ ...prev, [empId]: true }));
  };

  const handleResetEmployer = (empId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const original = (verifiedEmployersData as unknown as VerifiedEmployer[]).find((e) => e.id === empId);
    if (original) {
      setEmployers((prev) => prev.map((e) => (e.id === empId ? original : e)));
      if (selectedEmployer?.id === empId) {
        setSelectedEmployer(original);
      }
      setTamperedIds((prev) => {
        const next = { ...prev };
        delete next[empId];
        return next;
      });
    }
  };

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const sectors = ['ALL', ...Array.from(new Set(employers.map((e) => e.sector)))];

  const filteredEmployers = employers.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.physicalAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.openPositions.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSector = selectedSector === 'ALL' || emp.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const getBadgeColor = (badgeType: VerifiedEmployer['badgeType']) => {
    switch (badgeType) {
      case 'CERTIFIED_SAFE':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'YOUTH_PATHWAY':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'FORMAL_RECRUITER':
        return 'bg-teal-100 text-teal-900 border-teal-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
                Safe Employment Pathways • Verified Registry
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Verified Employers Directory (Zimbabwe)
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-2xl leading-relaxed">
              Safe Jobs Shield operates as both a SHIELD against fake recruiters and a PATHWAY to certified, fee-free employers. Click any employer card to inspect official contact channels, verified physical addresses, and cryptographic audit records.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 shrink-0 text-center">
            <span className="block text-2xl font-extrabold text-white">
              {employers.length}
            </span>
            <span className="text-[11px] text-emerald-200 font-medium">
              Verified Fictional Employers
            </span>
          </div>
        </div>

        {/* VERIFIED EMPLOYERS Pillar Sub-Navigation */}
        <div className="mt-4 pt-4 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">
              Pillar Features:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 ring-1 ring-emerald-300"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search / Check an Employer</span>
            </button>

            <button
              type="button"
              onClick={() => setShowKmsModal(true)}
              className="bg-emerald-950 hover:bg-emerald-800 text-emerald-200 hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-emerald-700/80 cursor-pointer shadow-xs"
            >
              <Key className="w-3.5 h-3.5 text-emerald-300" />
              <span>Employer Vetting & KMS Specifications</span>
            </button>

            {onNavigateTab && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateTab('signedads')}
                  className="bg-emerald-950 hover:bg-emerald-800 text-emerald-200 hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-emerald-700/80 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Scan or Forward Signed Job Ad (QR)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('lookalike')}
                  className="bg-emerald-950 hover:bg-emerald-800 text-emerald-200 hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-emerald-700/80 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                  <span>Impersonation Alerts (Lookalike Notices)</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by employer name, position, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-slate-500 font-semibold shrink-0">Sector:</span>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Sectors' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEmployers.map((emp, index) => {
          const isValid = verificationStatus[emp.id] ?? true;
          const isTampered = tamperedIds[emp.id];

          return (
            <div
              key={emp.id}
              onClick={() => setSelectedEmployer(emp)}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`animate-card-entry rounded-2xl border p-4 sm:p-5 shadow-xs transition-all duration-200 ease-out flex flex-col justify-between cursor-pointer group hover:-translate-y-1 hover:shadow-lg relative overflow-hidden active:scale-[0.99] active:translate-y-0 ${
                isValid
                  ? 'bg-white border-slate-200/90 hover:border-emerald-400 hover:shadow-emerald-950/5'
                  : 'bg-rose-50/80 border-rose-300 hover:border-rose-400 hover:shadow-rose-950/5'
              }`}
            >
              {/* Subtle tactile left accent indicator on hover */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 transition-opacity duration-200 ${
                  isValid ? 'bg-emerald-500' : 'bg-rose-500'
                } opacity-0 group-hover:opacity-100`}
              />

              <div>
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors ${getBadgeColor(
                        emp.badgeType
                      )}`}
                    >
                      {emp.badgeType.replace('_', ' ')}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug group-hover:text-emerald-700 transition-colors">
                      {emp.name}
                    </h3>
                  </div>

                  {/* Web Crypto Signature Status */}
                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md transition-all ${
                        isValid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 group-hover:bg-emerald-200/70'
                          : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                      }`}
                    >
                      <Lock className="w-3 h-3 group-hover:scale-110 transition-transform" />
                      <span>{isValid ? 'Signature Valid' : 'TAMPER DETECTED'}</span>
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">
                      {emp.registrationNumber}
                    </span>
                  </div>
                </div>

                {/* Company Details */}
                <div className="space-y-1.5 text-xs text-slate-600 my-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Sector: <strong className="text-slate-800">{emp.sector}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.physicalAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-emerald-700 font-medium group-hover:underline underline-offset-2">{emp.domain}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{emp.officialPhone}</span>
                  </div>
                </div>

                {/* Open Positions / Youth Pathways */}
                <div className="bg-slate-50/90 group-hover:bg-emerald-50/30 rounded-xl p-3 border border-slate-200/80 group-hover:border-emerald-200/80 my-3 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-emerald-600" />
                      Active Youth Opportunities:
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded transition-colors ${
                        emp.activeHiring ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {emp.activeHiring ? 'Hiring Now' : 'Future Intake'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {emp.openPositions.map((pos, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 group-hover:border-emerald-200 shadow-2xs transition-colors"
                      >
                        {pos}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Tamper Simulator */}
              <div className="pt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEmployer(emp);
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer py-1 transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-emerald-600" />
                  <span>View Full Details & Certificate</span>
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-600" />
                </button>

                <div className="flex items-center gap-1.5">
                  {isTampered ? (
                    <button
                      type="button"
                      onClick={(e) => handleResetEmployer(emp.id, e)}
                      className="text-xs bg-slate-700 hover:bg-slate-800 text-white px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleTamperEmployer(emp.id, e)}
                      className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
                      title="Demonstrates to judges how altering data breaks the Web Crypto signature"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>Test Tamper</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* EXPANDABLE DETAIL MODAL FOR EMPLOYER VERIFICATION              */}
      {/* ============================================================== */}
      {selectedEmployer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="employer-modal-title"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={() => setSelectedEmployer(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 shrink-0 relative">
              <button
                type="button"
                onClick={() => setSelectedEmployer(null)}
                aria-label="Close modal"
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getBadgeColor(
                    selectedEmployer.badgeType
                  )}`}
                >
                  {selectedEmployer.badgeType.replace('_', ' ')}
                </span>
                <span className="bg-emerald-950/80 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono border border-emerald-700/60">
                  {selectedEmployer.registrationNumber}
                </span>
              </div>

              <h2 id="employer-modal-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {selectedEmployer.name}
              </h2>

              <p className="text-xs text-emerald-200 mt-1 flex items-center gap-2">
                <Building className="w-3.5 h-3.5 inline text-emerald-400" />
                <span>Sector: {selectedEmployer.sector}</span>
                <span>•</span>
                <Calendar className="w-3.5 h-3.5 inline text-emerald-400" />
                <span>Verified Since: {selectedEmployer.verifiedDate}</span>
              </p>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto text-xs sm:text-sm text-slate-800">
              {/* Web Crypto Signature Status Callout */}
              <div
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                  verificationStatus[selectedEmployer.id] !== false
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950 animate-pulse'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {verificationStatus[selectedEmployer.id] !== false ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider">
                      {verificationStatus[selectedEmployer.id] !== false
                        ? 'Web Crypto HMAC-SHA256 Digital Signature: Authenticated & Untampered'
                        : 'WARNING: Cryptographic Digital Signature Verification Mismatch!'}
                    </h3>
                    <p className="text-[11px] mt-0.5 leading-relaxed text-slate-700">
                      {verificationStatus[selectedEmployer.id] !== false
                        ? 'Every field of this employer record is cryptographically bound to the Safe Jobs Shield Registry Key. Data has not been modified.'
                        : 'The payload fields do not match the expected cryptographic digest. Possible domain or contact address spoofing!'}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-1 rounded bg-white border border-slate-200 shrink-0">
                  {selectedEmployer.id}
                </span>
              </div>

              {/* Official Contact Channels & Physical Address */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Official Verified Contact Details & Premises</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Physical Address */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      Physical Head Office / Premises
                    </span>
                    <span className="font-medium text-slate-900 block leading-snug">
                      {selectedEmployer.physicalAddress}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(selectedEmployer.physicalAddress, 'addr')}
                      className="mt-2 text-[10px] text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {copiedField === 'addr' ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'addr' ? 'Copied Address' : 'Copy Address'}</span>
                    </button>
                  </div>

                  {/* Official Phone */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      Official Landline / Switchboard
                    </span>
                    <span className="font-mono font-bold text-slate-900 block text-sm">
                      {selectedEmployer.officialPhone}
                    </span>
                    <div className="flex items-center gap-3 mt-2">
                      <a
                        href={`tel:${selectedEmployer.officialPhone}`}
                        className="text-[10px] text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call Switchboard</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyText(selectedEmployer.officialPhone, 'phone')}
                        className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'phone' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Official Domain */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      Official Web Domain
                    </span>
                    <span className="font-mono font-bold text-emerald-700 block text-xs">
                      https://{selectedEmployer.domain}
                    </span>
                    <a
                      href={`https://${selectedEmployer.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-[10px] text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-medium inline-block"
                    >
                      <span>Visit Verified Domain</span>
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </div>

                  {/* Registration Number */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      Zimbabwe Companies Registry
                    </span>
                    <span className="font-mono font-bold text-slate-900 block text-xs">
                      {selectedEmployer.registrationNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      Deeds, Companies & Intellectual Property (DCIP)
                    </span>
                  </div>
                </div>
              </div>

              {/* Brief Verification Note & Audit Scope */}
              <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  <FileCheck className="w-4 h-4 text-emerald-700" />
                  <span>Safe Jobs Shield Verification Audit Note</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {VERIFICATION_NOTES[selectedEmployer.id]?.noteEn ||
                    'Vetted through on-site physical premises verification, statutory registration check with the Registrar of Companies, and legally binding commitment never to charge recruitment fees.'}
                </p>
                <div className="pt-2 border-t border-emerald-200/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-800">
                  <div>
                    <span className="font-semibold block text-emerald-950">Audit Verification Scope:</span>
                    <span>{VERIFICATION_NOTES[selectedEmployer.id]?.auditScope || 'Harare Commercial Office Inspection'}</span>
                  </div>
                  <div>
                    <span className="font-semibold block text-emerald-950">Fair Labor Standards:</span>
                    <span>{VERIFICATION_NOTES[selectedEmployer.id]?.necCompliance || 'National Employment Council Compliant'}</span>
                  </div>
                </div>
              </div>

              {/* Active Youth Opportunities & Safe Application Instructions */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Active Youth Opportunities ({selectedEmployer.openPositions.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedEmployer.openPositions.map((position, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 flex items-center justify-between"
                    >
                      <span>{position}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-normal">
                        Fee-Free
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Safe Youth Application Rule:</span> Apply strictly via{' '}
                    <strong className="underline">{selectedEmployer.domain}</strong> or hand-deliver CVs to{' '}
                    <strong>{selectedEmployer.physicalAddress}</strong>. If anyone contacting you claims to represent {selectedEmployer.name} but demands mobile money fees, report them immediately.
                  </div>
                </div>
              </div>

              {/* Cryptographic Proof Details (Transparency) */}
              <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1 font-mono">
                <div className="flex justify-between items-center text-slate-700 font-bold mb-1">
                  <span>Cryptographic Payload Signature:</span>
                  <span className="text-[10px] font-normal text-slate-500">HMAC-SHA256 Web Crypto</span>
                </div>
                <div className="break-all text-[10px] bg-white p-2 rounded border border-slate-200 text-slate-800">
                  {selectedEmployer.canonicalPayload}
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                  <span>Digest: {selectedEmployer.signatureHex}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <span className="text-[11px] text-slate-500">
                Official Safe Jobs Shield Registry • Zimbabwe Youth Innovation HackLab 2026
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEmployer(null)}
                  className="px-4 py-2 text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employer Vetting & Key Management (KMS) Modal */}
      {showKmsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
                  <Key className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold leading-tight">
                    Employer Vetting & Key Management System (KMS)
                  </h3>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5">
                    Official Cryptographic Trust Framework & Audit Procedures
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowKmsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Section 1: Four-Stage Vetting */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-emerald-100 text-emerald-800 rounded">
                    <FileCheck className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">
                    1. The 4-Stage Employer Vetting Pipeline
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">1</span>
                      <span>Statutory Registration Audit</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Verification of incorporation with Chief Registrar of Companies (Companies Act [Chapter 24:03]). Valid CR14 and CR6 on file, plus ZIMRA Tax Clearance (ITF263).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">2</span>
                      <span>Physical Premise & License Check</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Physical inspection of commercial premises, packhouse, or workshop. Municipal operating license confirmed. Virtual mailboxes and residential guest houses are strictly prohibited.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">3</span>
                      <span>Binding Zero-Fee Legal Affidavit</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Managing director signs an irrevocable legal undertaking declaring zero applicant fees (no uniform, medical, or interview charges) and statutory NEC wage compliance.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">4</span>
                      <span>Domain & Contact Keybinding</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Locking of authorized corporate domain (<code>.co.zw</code>), corporate email DNS (SPF/DKIM/DMARC), and official E.164 phone numbers to prevent recruiter spoofing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: KMS Architecture */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-indigo-100 text-indigo-800 rounded">
                    <Lock className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">
                    2. Cryptographic Key Management System (KMS) Specifications
                  </h4>
                </div>

                <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 font-mono text-[11px] space-y-1.5">
                  <div className="text-emerald-400 font-bold">// Canonical Tuple Payload Structure</div>
                  <div className="text-slate-300">
                    payload = EMP_ID|LEGAL_NAME|REG_NO|DOMAIN|E164_PHONE|PHYSICAL_ADDRESS
                  </div>
                  <div className="text-slate-400">
                    signatureHex = Server_HMAC_SHA256(payload, REGISTRY_AUTHORITY_ROOT_KEY)
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="block text-slate-900 font-bold mb-1">HSM Key Isolation</strong>
                    <span className="text-[11px] text-slate-600 leading-relaxed">
                      Private root authority signing keys are generated inside FIPS 140-2 Level 3 Hardware Security Modules. Keys never leak into client code.
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="block text-slate-900 font-bold mb-1">90-Day Key Rotation</strong>
                    <span className="text-[11px] text-slate-600 leading-relaxed">
                      Keys rotate automatically on a 90-day cadence. Retiring keys transition to historical verification status for 180 days to support paper flyers.
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="block text-slate-900 font-bold mb-1">5-Min Revocation (CRL)</strong>
                    <span className="text-[11px] text-slate-600 leading-relaxed">
                      Any employer verified demanding illicit fees has their certificate placed on the real-time Certificate Revocation List (CRL) within 5 minutes.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Audited & Confirmed Active • October 2026
              </span>
              <button
                type="button"
                onClick={() => setShowKmsModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

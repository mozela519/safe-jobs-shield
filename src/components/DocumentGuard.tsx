import React, { useState, useRef, useEffect } from 'react';
import { Language, SessionCheckItem } from '../types';
import { translations } from '../i18n/translations';
import {
  ShieldCheck,
  Lock,
  Upload,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  Sparkles,
  RefreshCw,
  Eye,
  Sliders,
  Check,
} from 'lucide-react';

interface DocumentGuardProps {
  language: Language;
  prefillEmployer?: string;
  onRecordCheck?: (check: SessionCheckItem) => void;
}

export const DocumentGuard: React.FC<DocumentGuardProps> = ({
  language,
  prefillEmployer,
  onRecordCheck,
}) => {
  const t = translations[language];
  const [employerName, setEmployerName] = useState(prefillEmployer || 'ZimFresh Agribusiness Ltd');

  useEffect(() => {
    if (prefillEmployer) {
      setEmployerName(prefillEmployer);
    }
  }, [prefillEmployer]);
  const [purposeText, setPurposeText] = useState('Employment Application Only');
  const [opacity, setOpacity] = useState(0.45);
  const [fontSize, setFontSize] = useState(24);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [copiedNote, setCopiedNote] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate synthetic sample ID card on canvas if no user image uploaded
  const loadSampleId = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 440;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient (Simulated National ID Card layout)
    const grad = ctx.createLinearGradient(0, 0, 700, 440);
    grad.addColorStop(0, '#f0fdf4');
    grad.addColorStop(1, '#dcfce7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 700, 440);

    // Card border
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 680, 420);

    // Header banner
    ctx.fillStyle = '#166534';
    ctx.fillRect(10, 10, 680, 65);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('REPUBLIC OF ZIMBABWE — NATIONAL IDENTITY CARD', 30, 48);

    // Photo placeholder box
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(40, 105, 140, 175);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 105, 140, 175);
    ctx.fillStyle = '#64748b';
    ctx.font = '14px sans-serif';
    ctx.fillText('PHOTO', 85, 195);

    // Cardholder text details (clearly marked synthetic)
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('CITIZEN NAME: TENDAI MOYO', 210, 130);
    ctx.font = 'normal 13px sans-serif';
    ctx.fillText('NATIONAL ID NO: 63-884129-F-26', 210, 160);
    ctx.fillText('DATE OF BIRTH: 14 MARCH 2002', 210, 190);
    ctx.fillText('VILLAGE / CHIEF: CHIWESHE / NEGOMO', 210, 220);
    ctx.fillText('DISTRICT OF REGISTRATION: MAZOWE', 210, 250);

    // Watermark warning at bottom of sample
    ctx.fillStyle = '#dc2626';
    ctx.font = 'italic 12px sans-serif';
    ctx.fillText('SYNTHETIC SPECIMEN CARD — DEFENSIVE DEMO ONLY', 210, 290);

    // Thumbprint placeholder
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(520, 105, 120, 150);
    ctx.fillStyle = '#475569';
    ctx.fillText('FINGERPRINT', 535, 185);

    setImageSrc(canvas.toDataURL('image/png'));
  };

  useEffect(() => {
    loadSampleId();
  }, []);

  // Redraw canvas with watermarking whenever parameters change
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw base document
      ctx.drawImage(img, 0, 0);

      // Current formatted date
      const today = new Date().toISOString().split('T')[0];
      const stampText = `FOR ${employerName.toUpperCase()} • ${today} • ${purposeText.toUpperCase()} • DO NOT DUPLICATE`;

      // Configure watermark styling
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = '#dc2626'; // High-visibility security red
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;

      // Rotate canvas diagonally (-28 degrees) and tile watermark across the whole image
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((-28 * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      const stepX = 550;
      const stepY = 110;

      for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
        for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
          ctx.strokeText(stampText, x, y);
          ctx.fillText(stampText, x, y);
        }
      }

      ctx.restore();
    };
  }, [imageSrc, employerName, purposeText, opacity, fontSize]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sanitizedName = employerName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `watermarked_id_for_${sanitizedName}.png`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();

    // Record guarded document check in session history
    onRecordCheck?.({
      id: 'chk-doc-' + Date.now(),
      type: 'guarded_document',
      timestamp: Date.now(),
      title: `Watermarked ID for ${employerName}`,
      snippet: `FOR ${employerName.toUpperCase()} • ${new Date().toISOString().split('T')[0]} • ${purposeText.toUpperCase()} • DO NOT DUPLICATE`,
      verdict: 'DOCUMENT_GUARDED',
      identifiers: [
        {
          type: 'filename',
          value: filename,
          label: 'Guarded PNG File',
        },
        {
          type: 'employer',
          value: employerName,
          label: 'Authorized Recipient',
        },
      ],
      metadata: {
        employerName,
        documentType: 'National ID / Passport Copy',
        purpose: purposeText,
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
                Damage Reduction & Identity Defense
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Document Guard: Client-Side ID Watermarker
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-2xl leading-relaxed">
              Most scam tools only warn after the fact. Document Guard protects you before sharing: stamps irreversible employer-bound watermarks on your ID copy so scammers cannot use it for micro-loans, SIM swaps, or identity theft.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <Lock className="w-3.5 h-3.5" />
              100% Client-Side Canvas
            </span>
            <span className="block text-[11px] text-emerald-200/80 mt-0.5">
              Images never leave your phone/browser
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Watermark Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Watermark Protection Settings</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Stamp recipient details directly across the document face:
              </p>
            </div>

            {/* Target Employer Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Employer Name:
              </label>
              <input
                type="text"
                value={employerName}
                onChange={(e) => setEmployerName(e.target.value)}
                placeholder="e.g. ZimFresh Agribusiness Ltd"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Purpose Tag Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Authorized Purpose Note:
              </label>
              <input
                type="text"
                value={purposeText}
                onChange={(e) => setPurposeText(e.target.value)}
                placeholder="e.g. Employment Application Only"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Opacity Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Watermark Opacity:</span>
                <span className="font-mono text-emerald-700 font-bold">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.80"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Font Size Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Text Density:</span>
                <span className="font-mono text-slate-600">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="18"
                max="36"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Action Upload / Reset Buttons */}
            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs px-3 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Your ID Copy / Passport Photo</span>
              </button>

              <button
                type="button"
                onClick={loadSampleId}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Load Synthetic Sample ID Card</span>
              </button>
            </div>
          </div>

          {/* Privacy Guarantee Card */}
          <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>Zero-Leakage Security Guarantee:</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              All pixel operations take place in your browser&apos;s memory using HTML5 Canvas. Your identification document is <strong>never uploaded to our server or any cloud service</strong>.
            </p>
          </div>
        </div>

        {/* Right Column: Canvas Live Preview & Download (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  Protected Document Preview
                </span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Diagonal Security Stamping Active
                </span>
              </div>

              {/* Canvas viewport container */}
              <div className="bg-slate-100 rounded-xl p-2 border border-slate-300 flex items-center justify-center overflow-hidden min-h-[320px]">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto rounded shadow-md border border-slate-300 object-contain"
                />
              </div>

              <p className="text-[11px] text-slate-500 mt-2 text-center">
                Watermarked text: &quot;FOR {employerName.toUpperCase()} • {new Date().toISOString().split('T')[0]} • {purposeText.toUpperCase()}&quot;
              </p>
            </div>

            {/* Download Button */}
            <div className="pt-4 mt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                Safe format: PNG with embedded overlay
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Watermarked ID Copy</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DOCUMENT SAFETY STAGE GUIDE (When is it safe to share what?)     */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Document Safety Stage Guide: What to Share & When
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Most identity theft occurs when youth share national IDs or birth certificates too early. Follow this safe recruitment lifecycle:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Stage 1 */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                Stage 1: Application
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2">CV & Cover Letter Only</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Provide your skills, qualifications, work history, and contact details.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-rose-700 font-semibold">
              ⛔ NEVER send ID copy, passport scan, or birth certificate here.
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                Stage 2: Interview
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Certificates & Portfolio</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Bring copies of academic certificates, references, or work portfolio for in-person review.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-amber-700 font-semibold">
              ⚠️ In-person presentation only. Do not surrender physical originals.
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                Stage 3: Formal Offer
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Watermarked ID Copy</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Once a formal written job contract is issued, provide an ID copy watermarked with the employer name using this tool.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-emerald-700 font-semibold">
              ✅ Use Document Guard to stamp recipient name and date.
            </div>
          </div>

          {/* Stage 4: NEVER */}
          <div className="bg-rose-50 rounded-xl p-4 border border-rose-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded uppercase">
                Absolute Prohibitions
              </span>
              <h4 className="text-sm font-bold text-rose-950 mt-2">Never Share at Any Stage</h4>
              <ul className="text-xs text-rose-900 mt-1 space-y-1 list-disc list-inside">
                <li>Bank Card CVV or ATM PIN</li>
                <li>SMS OTP verification codes</li>
                <li>EcoCash / InnBucks PIN</li>
                <li>Surrendering physical passport</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-rose-200 text-[11px] text-rose-800 font-bold">
              🚨 Demanding PINs is 100% fraud.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

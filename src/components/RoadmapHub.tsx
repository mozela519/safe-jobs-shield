import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import {
  ShieldAlert,
  MapPin,
  Clock,
  PhoneCall,
  Share2,
  Copy,
  Check,
  TrendingUp,
  BarChart3,
  Users,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Building,
  GraduationCap,
  Sparkles,
  Download,
  ExternalLink,
  MessageSquare,
  FileText,
} from 'lucide-react';

interface RoadmapHubProps {
  language: Language;
}

export const RoadmapHub: React.FC<RoadmapHubProps> = ({ language }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'interview' | 'earlywarning' | 'ambassadors'>('interview');

  // Safe Interview Plan State
  const [recruiterName, setRecruiterName] = useState('Tendai Moyo (Alleged Apex Agro)');
  const [interviewAddress, setInterviewAddress] = useState('14 Nelson Mandela Ave, Harare CBD (Corner First St)');
  const [interviewDateTime, setInterviewDateTime] = useState('Tomorrow at 10:30 AM');
  const [checkInTime, setCheckInTime] = useState('11:45 AM (1 hour 15 mins after arrival)');
  const [trustedFriendName, setTrustedFriendName] = useState('Farai');
  const [copiedShareText, setCopiedShareText] = useState(false);

  // Early-Warning Dashboard Filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');

  const shareMessageTemplate = `SAFE INTERVIEW NOTIFICATION [Safe Jobs Shield Zim]
Hi ${trustedFriendName || 'Friend'}, I am attending a job interview with ${recruiterName}.
📍 Location: ${interviewAddress}
⏰ Scheduled Time: ${interviewDateTime}
🚨 SAFETY CHECK-IN: If I have not called or sent you a WhatsApp confirmation by ${checkInTime}, please call me immediately or contact ZRP / Musasa Project.
Safety rule: I will NOT hand over my original passport or pay any interview cash.`;

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareMessageTemplate);
    setCopiedShareText(true);
    setTimeout(() => setCopiedShareText(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareMessageTemplate);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Sample aggregated trend data for the 10 provinces / major districts
  const DISTRICT_TRENDS = [
    { district: 'Harare CBD & Mbare', reportsThisWeek: 42, topScam: 'EcoPay Uniform Fee', delta: '+34%' },
    { district: 'Bulawayo Central', reportsThisWeek: 28, topScam: 'Graduate Trainee Lookalike', delta: '+12%' },
    { district: 'Mutare & Manicaland', reportsThisWeek: 19, topScam: 'Timber Estate Advance Fee', delta: '+8%' },
    { district: 'Gweru & Kwekwe', reportsThisWeek: 15, topScam: 'Mining Equipment Trainee', delta: '+18%' },
    { district: 'Masvingo Urban', reportsThisWeek: 12, topScam: 'Supermarket Cashier Fee', delta: '-5%' },
    { district: 'Chitungwiza', reportsThisWeek: 24, topScam: 'Foreign VIP Domestic Worker (Gulf)', delta: '+45%' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                <Compass className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
                Roadmap Initiatives • 12-Month Expansion Plan
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Safety Ecosystem & Institutional Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
              Extending the Shield beyond the chat interface: proactive interview protection for women and vulnerable youth, aggregated early-warning trends for government and NGO partners, and a peer-led ambassador network.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-emerald-700/60 self-start md:self-center">
            <button
              onClick={() => setActiveTab('interview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'interview'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Safe Interview Plan</span>
            </button>
            <button
              onClick={() => setActiveTab('earlywarning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'earlywarning'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Partner Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('ambassadors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'ambassadors'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Youth Ambassadors</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: SAFE INTERVIEW PLAN */}
      {activeTab === 'interview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Interactive Location & Emergency Share Generator */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Share2 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Pre-Interview &quot;Buddy Alert&quot; Share Generator
                    </h3>
                    <p className="text-xs text-slate-500">
                      Generate an emergency check-in briefing for your family or friend before attending an interview
                    </p>
                  </div>
                </div>
                <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                  Women & Youth Safety
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Recruiter / Company Name
                  </label>
                  <input
                    type="text"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
                    placeholder="e.g. Tendai (Alleged Agro)"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Trusted Friend / Contact Name
                  </label>
                  <input
                    type="text"
                    value={trustedFriendName}
                    onChange={(e) => setTrustedFriendName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
                    placeholder="e.g. Farai / Mai Tinashe"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Interview Venue & Physical Address
                  </label>
                  <input
                    type="text"
                    value={interviewAddress}
                    onChange={(e) => setInterviewAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
                    placeholder="e.g. 14 Nelson Mandela Ave, Harare CBD"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date & Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={interviewDateTime}
                    onChange={(e) => setInterviewDateTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
                    placeholder="e.g. Tomorrow at 10:30 AM"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mandatory Check-In Deadline (Safety Alarm)
                  </label>
                  <input
                    type="text"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
                    placeholder="e.g. 11:45 AM (if no call by this time, trigger alert)"
                  />
                </div>
              </div>

              {/* Generated Message Preview */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Generated Alert Message (Ready to Send to Buddy)
                  </span>
                  <span className="text-[10px] text-slate-500">Live preview</span>
                </div>
                <pre className="text-[11px] font-mono text-slate-800 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {shareMessageTemplate}
                </pre>

                <div className="flex flex-wrap items-center gap-3 mt-3 pt-2">
                  <button
                    onClick={handleCopyShare}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedShareText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedShareText ? 'Copied to Clipboard!' : 'Copy Safety Message'}</span>
                  </button>

                  <button
                    onClick={handleWhatsAppShare}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Non-Negotiable Safety Checklist */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Non-Negotiable Interview Rules</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2 p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-950 block">Never Go to Private Residences</span>
                    <span className="text-[11px] text-rose-800 leading-snug">
                      Legitimate employers interview at commercial offices, schools, registered factories, or public premises. Never enter a lodge, hotel room, or private house alone.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950 block">Keep Your Passport & Phone</span>
                    <span className="text-[11px] text-amber-800 leading-snug">
                      If an interviewer asks to &quot;hold&quot; your phone, National ID card, or passport during the conversation, refuse immediately and leave.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950 block">Daylight Hours Only</span>
                    <span className="text-[11px] text-emerald-800 leading-snug">
                      Schedule meetings between 08:30 and 16:00. Evening interviews (&quot;after hours at 19:00&quot;) are a severe personal safety danger.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                  <PhoneCall className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-950 block">Live Emergency Contacts</span>
                    <div className="text-[11px] text-blue-900 mt-1 space-y-0.5 font-mono">
                      <div>• Musasa Project (GBV/Safety): <strong>0808 0074</strong> [Confirmed: Oct 2026]</div>
                      <div>• ZRP Anti-Trafficking / National Complaints: <strong>+263 242 703631</strong> [Confirmed: Oct 2026]</div>
                      <div>• Childline / Youth Helpline: <strong>116</strong> [Confirmed: Oct 2026]</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EARLY-WARNING PARTNER DASHBOARD */}
      {activeTab === 'earlywarning' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    District-Level Scam Early-Warning Trends
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Privacy-preserving aggregated data shared with the Ministry of Youth, TVETs, and NGO empowerment partners.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Zero Cleartext PII Stored
                </span>
              </div>
            </div>

            {/* Overview KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Aggregated Flags This Week</div>
                <div className="text-2xl font-black text-slate-900 mt-1">140</div>
                <div className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +22% vs last week
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Top Surging Vector</div>
                <div className="text-base font-bold text-amber-700 mt-1">EcoPay Uniform Fee</div>
                <div className="text-[11px] text-slate-500 mt-1">42% of youth reports</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Trafficking Flags Intercepted</div>
                <div className="text-2xl font-black text-rose-700 mt-1">18</div>
                <div className="text-[11px] text-rose-600 font-semibold mt-1">Referred to Musasa/ZRP</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Verified Safe Placements</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">87</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">Via Certified Employers</div>
              </div>
            </div>

            {/* District Breakdown Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Provincial & District Hotspot Monitoring (Past 7 Days)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">District / Zone</th>
                      <th className="py-2.5 px-4">Incidents Reported</th>
                      <th className="py-2.5 px-4">Dominant Scam Tactic</th>
                      <th className="py-2.5 px-4">Weekly Trend</th>
                      <th className="py-2.5 px-4 text-right">Advisory Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {DISTRICT_TRENDS.map((row) => (
                      <tr key={row.district} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{row.district}</td>
                        <td className="py-3 px-4">{row.reportsThisWeek} reports</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded text-[11px] font-medium border border-amber-200">
                            {row.topScam}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{row.delta}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">
                            Active Advisory
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Notice */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-emerald-900 font-medium">
                  Partner institutions (POTRAZ, Ministry of Youth, Employers Confederation) can subscribe to weekly anonymized threat intelligence bulletins.
                </span>
              </div>
              <button
                onClick={() => alert('Demo Mode: Weekly PDF & CSV threat dispatch is prepared for HackLab deployment.')}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shrink-0 cursor-pointer text-xs"
              >
                Download Sample Bulletin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: YOUTH AMBASSADOR NETWORK */}
      {activeTab === 'ambassadors' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Grassroots Youth Ambassador Network
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Mobilizing university students and community youth leaders across Zimbabwe to bridge the digital and literacy divide.
              </p>
            </div>

            {/* Pillar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">1. Campus & Polytechnic Hubs</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Student ambassadors stationed at University of Zimbabwe, NUST, Harare Polytechnic, and Chinhoyi University run weekly fraud-awareness clinics during graduation and internship seasons.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">2. Physical Flyer Interception</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Ambassadors photograph and upload fake recruitment posters plastered around combi ranks (Market Square, Fourth St, Renkini Bulawayo) directly into our OCR scanner, protecting offline youth.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">3. Paid Youth Employment</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  HackLab Category 2 directly powers youth economic empowerment: ambassadors earn monthly mobile data stipends and certified digital security credentials for conducting community outreach.
                </p>
              </div>
            </div>

            {/* Curriculum Highlights */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 mb-2">
                Ambassador 3-Step Verification Playbook:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-emerald-700 block">Step A: Rapid Scan</span>
                  <span className="text-[11px] text-slate-600">
                    Use *707# USSD or WhatsApp simulator to run the 8 weighted rules on suspicious text in &lt;10 seconds.
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-emerald-700 block">Step B: Watermark ID</span>
                  <span className="text-[11px] text-slate-600">
                    Teach job seekers to apply Document Guard stamps before emailing any identification document.
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-emerald-700 block">Step C: Route to Formal Work</span>
                  <span className="text-[11px] text-slate-600">
                    Direct applicants to digitally signed ads from vetted employers in agriculture, tech, and tourism.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Safe Jobs Shield - Deterministic Defensive Rules Engine
 * Zimbabwe Youth Innovation HackLab 2026
 *
 * Implements weighted heuristics, privacy-preserving identifier hashing,
 * exploitation/trafficking alerts, and verifiable employer checks.
 *
 * NOTE: Never outputs hard accusations. Returns risk indicators,
 * transparent score calculations, and safe next-step actions.
 */

import {
  DetectionResult,
  ExtractedEntities,
  HelplineInfo,
  RiskVerdict,
  SignalResult,
  VerifiedEmployer,
} from '../types';
import { computeHmacSha256, normalizeIdentifier, redactPII, verifyEmployerSignature } from '../crypto/privacy';
import verifiedEmployersData from '../data/employers.json';

const verifiedEmployers = verifiedEmployersData as unknown as VerifiedEmployer[];

// National Anti-Trafficking & GBV Helpline for Zimbabwe
const ZIM_TRAFFICKING_HELPLINE: HelplineInfo = {
  name: 'Zimbabwe National Anti-Trafficking & GBV Helpline (Musasa Project & Police CID)',
  number: '08080074',
  freephone: true,
  hours: '24 Hours / 7 Days Toll-Free',
  description: {
    en: 'Confidential toll-free assistance for youth facing exploitation, suspicious foreign travel offers, or forced domestic work threats.',
    sn: 'Rubatsiro rwemahara rwakavanzika rwevechidiki vari panjodzi yekutorwa nevanhu kana kumanikidzwa mabasa emhiri kwemakungwa.',
    nd: 'Usizo lwamahhala lwemfihlo olwenzelwe intsha esengozini yokuthengiswa loba ukuthunyelwa emazweni angaziwayo.',
    _needsNativeSpeakerReview: true,
  },
};

// Known free email providers
const FREE_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com', 'aol.com', 'yandex.com', 'mail.com'];

// Suspicious / high-abuse TLDs often used in mass disposable phish
const SUSPICIOUS_TLDS = ['.xyz', '.top', '.buzz', '.work', '.click', '.loan', '.gq', '.cf', '.tk', '.ml'];

// URL shorteners
const URL_SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'cutt.ly', 'is.gd', 'shorturl.at', 'rb.gy'];

// Reputable Zimbabwean official second-level domains
const OFFICIAL_ZIM_DOMAINS = ['.co.zw', '.org.zw', '.ac.zw', '.gov.zw'];

export interface RuleEngineOptions {
  communityReportLookup?: (hashedId: string) => number;
}

/**
 * Main detection engine function
 */
export async function analyzeJobOffer(
  rawText: string,
  options?: RuleEngineOptions
): Promise<DetectionResult> {
  const trimmed = rawText.trim();
  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).filter(Boolean);

  // Redact PII first for privacy compliance
  const { redactedText, foundPhones, foundEmails, foundUrls } = redactPII(rawText);

  // Extract entities & compute privacy hashes
  const hashedIdentifiers: ExtractedEntities['hashedIdentifiers'] = [];
  for (const phone of foundPhones) {
    const hashed = await computeHmacSha256(phone);
    hashedIdentifiers.push({ rawType: 'phone', hashed, rawRedacted: phone });
  }
  for (const url of foundUrls) {
    const domain = url.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
    const hashed = await computeHmacSha256(domain);
    hashedIdentifiers.push({ rawType: 'domain', hashed, rawRedacted: domain });
  }
  for (const email of foundEmails) {
    const domain = email.split('@')[1]?.toLowerCase() || email;
    const hashed = await computeHmacSha256(domain);
    hashedIdentifiers.push({ rawType: 'email', hashed, rawRedacted: email });
  }

  const entities: ExtractedEntities = {
    phones: foundPhones,
    emails: foundEmails,
    urls: foundUrls,
    claimedEmployers: extractClaimedEmployers(rawText),
    hashedIdentifiers,
  };

  // Check against verified employers registry
  let matchedEmployer: VerifiedEmployer | null = null;
  let employerSignatureValid = false;

  for (const emp of verifiedEmployers) {
    const empDomain = emp.domain.toLowerCase();
    const empName = emp.name.toLowerCase();
    const hasDomainMatch = foundUrls.some((u) => u.toLowerCase().includes(empDomain)) ||
                           foundEmails.some((e) => e.toLowerCase().includes(empDomain));
    const hasNameMatch = lower.includes(empName.toLowerCase()) ||
                         entities.claimedEmployers.some((c) => c.toLowerCase().includes(empName));

    if (hasDomainMatch || (hasNameMatch && !foundEmails.some((e) => FREE_EMAIL_DOMAINS.some((f) => e.toLowerCase().includes(f))))) {
      matchedEmployer = emp;
      employerSignatureValid = await verifyEmployerSignature(emp.canonicalPayload, emp.signatureHex);
      break;
    }
  }

  // Handle ambiguous / insufficient text (short text with no actionable contact, url or keywords)
  const hasActionableSignals = foundEmails.length > 0 || foundUrls.length > 0 || hasHighRiskKeywords(lower);
  if (words.length < 15 && !hasActionableSignals && matchedEmployer === null) {
    return createNotEnoughInfoResult(redactedText, entities);
  }

  const signals: SignalResult[] = [];
  const positiveSignals: SignalResult[] = [];

  // ==========================================
  // 1. UPFRONT FEE SIGNALS (Weight: +35)
  // ==========================================
  const feeRegex = /\b(fee|fees|registration fee|uniform fee|medical fee|processing fee|badge fee|deposit|pay today|bhadhara|mari ye|mari yekupinda|ecopay|apexcash|simbabucks|savannapay|ecocash|mukuru|innbucks|western union|application fee|interview fee|training fee|consultancy fee)\b/i;
  const monetaryFeeRegex = /(\$\s*\d+|\d+\s*(?:usd|rtgs|zig|dollars|bucks|rand))\b/i;

  if (feeRegex.test(lower) && (monetaryFeeRegex.test(lower) || /pay|bhadhara|send|deposit/i.test(lower))) {
    const matches = lower.match(feeRegex) || [];
    signals.push({
      id: 'SIGNAL_UPFRONT_FEE',
      category: 'fee',
      severity: 'critical',
      weight: 72,
      label: {
        en: 'Upfront Payment or Processing Fee Demanded',
        sn: 'Kukumbirwa Mari Yekupinda, Uniform kana Registration',
        nd: 'Ukubhadhaliswa Imali Yokuqala Loba Ye-Uniform',
        _needsNativeSpeakerReview: true,
      },
      description: {
        en: 'The offer demands money for registration, uniform, badges, medicals or processing before starting. Legitimate employers in Zimbabwe never charge candidates to work.',
        sn: 'Basa iri riri kukumbira mari yeregistration, uniform kana badge usati watanga. Vashandirwi vepamutemo muZimbabwe havambobhadharisi vashandi mari.',
        nd: 'Lo msebenzi ucela imali yokubhalisa, i-uniform loba amabheji ungakaqali. Abaqhatshi bangempela eZimbabwe kababhadhalisi abantu imali ukuze basebenze.',
        _needsNativeSpeakerReview: true,
      },
      matchedKeywords: Array.from(new Set(matches)),
    });
  }

  // ==========================================
  // 2. IDENTITY, BANK PIN & OTP THEFT (Weight: +74)
  // ==========================================
  const idTheftRegex = /\b(bank pin|otp|security code|bank card|cvv|national id copy|send passport scan|original passport|id front and back|atm pin)\b/i;
  if (idTheftRegex.test(lower)) {
    const matches = lower.match(idTheftRegex) || [];
    signals.push({
      id: 'SIGNAL_IDENTITY_THEFT',
      category: 'identity',
      severity: 'critical',
      weight: 74,
      label: {
        en: 'Sensitive Credentials, Bank PIN or OTP Requested',
        sn: 'Kukumbirwa PIN yeBhangi, OTP kana Makopi eID',
        nd: 'Ukucelwa I-PIN Ye-Bank, I-OTP Loba I-Pasipoti',
        _needsNativeSpeakerReview: true,
      },
      description: {
        en: 'Requests for bank card photos, OTP verification codes, bank PINs or original passport confiscation before any physical interview is a direct hallmark of fraud or identity theft.',
        sn: 'Kukumbirwa mifananidzo yemakadhi ebhangi, maOTP codes kana passport chaiyo pasina interview zvinoratidza chitsotsi chekuba mari kana chitupa.',
        nd: 'Ukucelwa amakhadi e-bank, ama-OTP loba ipasipoti ungakaze wenze inhlolokhono kuyitshengiso yobugebengu lokuntshontsha amabizo.',
        _needsNativeSpeakerReview: true,
      },
      matchedKeywords: Array.from(new Set(matches)),
    });
  }

  // ==========================================
  // 3. FREE EMAIL USED BY CORPORATE ENTITY (Weight: +20)
  // ==========================================
  const usesFreeEmail = foundEmails.some((email) => {
    const dom = email.split('@')[1]?.toLowerCase();
    return FREE_EMAIL_DOMAINS.includes(dom);
  });
  const claimsCorporationOrOrg = /\b(ltd|limited|plc|pvt|corp|bank|ministry|un\b|united nations|econet|delta|innscor|ngo|council|government|embassy)\b/i.test(lower);

  if (usesFreeEmail && (claimsCorporationOrOrg || /careers|hr|recruitment|official/i.test(lower))) {
    signals.push({
      id: 'SIGNAL_FREE_EMAIL_MISMATCH',
      category: 'contact',
      severity: 'high',
      weight: 22,
      label: {
        en: 'Free Email Address Used for Corporate / Formal Role',
        sn: 'Kushandiswa kweEmail yeMahara (Gmail/Yahoo) neKambani Huru',
        nd: 'Ukusetshenziswa kwe-Email Yamahhala yiNkampani Enkulu',
        _needsNativeSpeakerReview: true,
      },
      description: {
        en: 'The sender claims to represent a recognized company, UN body or ministry, but provides a free public email address (@gmail, @yahoo, @outlook) instead of a verified corporate domain.',
        sn: 'Munhu uyu anoti anomirira kambani huru kana bazi rehurumende asi achishandisa email yemahara (Gmail/Yahoo) panzvimbo yewebsite yekambani.',
        nd: 'Umuntu lo uthi uvela enkampanini enkulu loba kuhulumende kodwa usebenzisa i-email yamahhala efana le-Gmail loba i-Yahoo.',
        _needsNativeSpeakerReview: true,
      },
      matchedKeywords: foundEmails,
    });
  }

  // ==========================================
  // 4. URGENCY & ARTIFICIAL PRESSURE (Weight: +15)
  // ==========================================
  const urgencyRegex = /\b(act now|urgent|immediately|pay today|limited slots|few slots remaining|offer expires today|only 15 places|before midnight|nekukasika|usanonoke|nhasi chete)\b/i;
  if (urgencyRegex.test(lower)) {
    const matches = lower.match(urgencyRegex) || [];
    signals.push({
      id: 'SIGNAL_URGENCY_PRESSURE',
      category: 'urgency',
      severity: 'medium',
      weight: 15,
      label: {
        en: 'High-Pressure Urgency Tactics',
        sn: 'Kumanikidza Nekumhanyisa Zvinhu (High Pressure)',
        nd: 'Ukujahisa Ngamandla Ukuze Ungacabangisisi',
        _needsNativeSpeakerReview: true,
      },
      description: {
        en: 'Scammers invent artificial deadlines ("slots closing today", "pay before 5pm") to trigger panic and prevent job seekers from verifying with family or employers.',
        sn: 'Vatsotsi vanowanzomhanyisa vanhu vachiti "slots dzirikupera nhasi" kuitira kuti usawana mukana wekubvunza hama kana kambani chaiyo.',
        nd: 'Abaqili bajahisa abantu besithi "amathuba ayaphela lamuhla" ukuze ungasitholi isikhathi sokubuza abazali loba inkampani ngokwayo.',
        _needsNativeSpeakerReview: true,
      },
      matchedKeywords: Array.from(new Set(matches)),
    });
  }

  // ==========================================
  // 5. UNREALISTIC SALARY / VAGUE OVERSEAS (Weight: +25)
  // ==========================================
  const unrealisticSalaryRegex = /(\$\s*(?:[3-9],\d{3}|\d{5,})|(?:3|4|5|6|7|8|9|10),\d{3}\s*(?:usd|dollars)|unrealistic salary)/i;
  const overseasVagueRegex = /\b(canada|poland|dubai|qatar|kuwait|uk|australia|overseas|visa sponsor|no ielts|no experience needed)\b/i;

  if (unrealisticSalaryRegex.test(lower) || (overseasVagueRegex.test(lower) && /fruit picker|cleaner|general worker|farm driver|packer/i.test(lower))) {
    signals.push({
      id: 'SIGNAL_UNREALISTIC_OVERSEAS_PROMISE',
      category: 'salary',
      severity: 'high',
      weight: 26,
      label: {
        en: 'Exaggerated Salary or Vague Overseas Placement',
        sn: 'Muhoro Mukuru Zvakanyanya Kana Basa reKunze Rinonyumwisa',
        nd: 'Iholo Elikhulu Ngokungajwayelekanga Loba Umsebenzi Wangaphandle',
        _needsNativeSpeakerReview: true,
      },
      description: {
        en: 'Offers promising thousands of dollars abroad for unskilled entry work ("no education needed, $6,500/mo in Canada") are common predatory baiting mechanisms.',
        sn: 'Zvivimbiso zvemari yakawandisa mhiri kwemakungwa pasina ruzivo rwebasa muenzaniso wezvitsotsi zvinoredza vechidiki.',
        nd: 'Izithembiso zemali enengi emazweni angaphandle ingela mfundo ziyindlela yokuyenga abasakhulayo.',
        _needsNativeSpeakerReview: true,
      },
      matchedKeywords: ['overseas promise', 'high salary bait'],
    });
  }

  // ==========================================
  // 6. PRIVATE CHAT & SECRECY DEMANDS (Weight: +20)
  // ==========================================
  const secrecyRegex = /\b(strictly between us|keep this secret|musaudza vamwe|don't tell anyone|private whatsapp only|ungatsheli muntu|inbox me privately|secret vacancy|do not call office)\b/i;
  if (secrecyRegex.test(lower)) {
    const matches = lower.match(secrecyRegex) || [];
    signals.push({
      id: 'SIGNAL_SECRECY_PRIVATE_CHAT',
      category: 'privacy',
      severity: 'high',
      weight: 22,
      label: {
        en: 'Secrecy Request & Informal Private Chat Routing',
        sn: 'Kukumbirwa Kuti Zvive Zvakavanzika Nekutaura paWhatsApp Chete',
        nd: 'Ukucelwa Imfihlo Lokukhulumela ku-WhatsApp Yodwa',
        _needsNativeSpeakerReview: true,
      },
      description: {
        en: 'Legitimate corporate vacancies are publicly documented. Demanding that the vacancy be kept secret or instructing not to contact the office is a major red flag.',
        sn: 'Mabasa emakambani anoitwa pachena. Munhu anoti "musaudza vamwe vanhu" kana kuti "fona paWhatsApp chete" ari kuedza kubira.',
        nd: 'Imisebenzi esemthethweni yaziwa ngumuntu wonke. Ukucelwa ukuthi ufihle kungaba yisu lobuqili.',
        _needsNativeSpeakerReview: true,
      },
      matchedKeywords: Array.from(new Set(matches)),
    });
  }

  // ==========================================
  // 7. EXPLOITATION & HUMAN TRAFFICKING RED FLAGS (Weight: +45)
  // ==========================================
  const traffickingRegex = /\b(body photos|full body photos|waist measurements|measurements|ages 19-27 only|flight tickets directly|private estate|hostess|domestic assistant.*dubai|surrender passport|confiscate)\b/i;
  const isEmergencyOrTrafficking = traffickingRegex.test(lower);

  if (isEmergencyOrTrafficking) {
    const matches = lower.match(traffickingRegex) || [];
    signals.push({
      id: 'SIGNAL_TRAFFICKING_EXPLOITATION_RISK',
      category: 'trafficking',
      severity: 'critical',
      weight: 48,
      label: {
        en: 'CRITICAL: Severe Exploitation or Human Trafficking Indicators',
        sn: 'YAMBIRO HURU: Zviratidzo Zvekutorwa Kwevanhu neHutapwa',
        nd: 'ISIXWAYISO ESIKHULU: Izitshengiso Zokuthengiswa Kwabantu',
        _needsNativeSpeakerReview: true,
      },
      description: {
        en: 'Demands for full-body photos, physical measurements, private ticket bookings without travel agency validation, or passport handover are documented trafficking indicators. Call the national helpline 08080074 immediately.',
        sn: 'Kukumbirwa mifananidzo yemuviri wose, zviyero zvechiuno, kana matikiti anorongwa nemunhu ega pasina agency rine rezinesi zviratidzo zvekutengeswa kwevanhu. Fona mahara pa 08080074.',
        nd: 'Ukucelwa izithombe zomzimba wonke, izilinganiso zomzimba, loba amathikithi ezindiza ahlelwa ngasese kuyizitshengiso zokuthengiswa kwabantu. Tshayela inombolo yamahhala 08080074.',
        _needsNativeSpeakerReview: true,
      },
      matchedKeywords: Array.from(new Set(matches)),
    });
  }

  // ==========================================
  // 8. SUSPICIOUS LINKS & LOOKALIKE DOMAINS (Weight: +25)
  // ==========================================
  let suspiciousLinkFound = false;
  for (const url of foundUrls) {
    const lowerUrl = url.toLowerCase();
    const isShortener = URL_SHORTENERS.some((s) => lowerUrl.includes(s));
    const isSuspiciousTld = SUSPICIOUS_TLDS.some((tld) => lowerUrl.includes(tld));
    const isLookalikeApex = lowerUrl.includes('apextelecom') && !lowerUrl.includes('apextelecom.co.zw');
    const isLookalikeHorizon = lowerUrl.includes('horizonbeverages') && !lowerUrl.includes('horizonbeverages.co.zw');
    const isLookalikeEconet = lowerUrl.includes('econet') && !lowerUrl.includes('econet.co.zw');
    const isLookalikeDelta = lowerUrl.includes('delta') && !lowerUrl.includes('delta.co.zw');

    if (isShortener || isSuspiciousTld || isLookalikeApex || isLookalikeHorizon || isLookalikeEconet || isLookalikeDelta) {
      suspiciousLinkFound = true;
      signals.push({
        id: 'SIGNAL_SUSPICIOUS_DOMAIN_OR_SHORTENER',
        category: 'link',
        severity: 'high',
        weight: 28,
        label: {
          en: 'Suspicious Domain, Shortened Link, or Lookalike URL',
          sn: 'Link Inonyumwisa, Lookalike Domain kana Shortened URL',
          nd: 'I-Link Esolisayo loba i-Website Yokuqilibezela',
          _needsNativeSpeakerReview: true,
        },
        description: {
          en: `Detected link (${url}) uses a high-risk TLD, URL shortener, or mimics a legitimate brand name to disguise fake websites.`,
          sn: `Link iyi (${url}) inoshandisa mazita anonyengedza kana mawebsite emanyepo asiri epamutemo.`,
          nd: `Le i-link (${url}) isebenzisa amabizo akhohlisayo afana lezinkampani zangempela.`,
          _needsNativeSpeakerReview: true,
        },
        matchedKeywords: [url],
      });
      break;
    }
  }

  // ==========================================
  // 9. REPUTATION COUNTER (From community reports)
  // ==========================================
  if (options?.communityReportLookup) {
    let maxReputationHits = 0;
    for (const h of hashedIdentifiers) {
      const count = options.communityReportLookup(h.hashed);
      if (count > maxReputationHits) maxReputationHits = count;
    }
    if (maxReputationHits > 0) {
      const repPenalty = Math.min(30, maxReputationHits * 10);
      signals.push({
        id: 'SIGNAL_COMMUNITY_FLAGGED_REPUTATION',
        category: 'reputation',
        severity: 'high',
        weight: repPenalty,
        label: {
          en: `Identifier Previously Flagged by Community (${maxReputationHits} reports)`,
          sn: `Nhamba kana Link Yakatombomhan'arwa neVamwe Vechidiki (${maxReputationHits})`,
          nd: `Le Nombolo loba I-Link Yake Yabikwa ngomunye Umphakathi (${maxReputationHits})`,
          _needsNativeSpeakerReview: true,
        },
        description: {
          en: `The cryptographic hash of this recruiter contact matches ${maxReputationHits} independent fraud reports in the community reputation pool.`,
          sn: `Cryptographic hash yenhamba iyi inopindirana nenhamba yevanhu ${maxReputationHits} vakambomhan'ara hutsotsi hwayo.`,
          nd: `I-hash yale nombolo ihambelana labantu abangu-${maxReputationHits} asebake babika ubuqili bayo.`,
          _needsNativeSpeakerReview: true,
        },
      });
    }
  }

  // ==========================================
  // 10. POSITIVE LEGITIMACY SIGNALS (Weight: -15 to -35)
  // ==========================================
  // A. Explicit zero-fees statement
  const noFeesRegex = /\b(never requests? any fee|do(?:es)? not charge any|no fees are charged|strictly no agency fees|equal opportunity employer|free of charge)\b/i;
  if (noFeesRegex.test(lower)) {
    positiveSignals.push({
      id: 'SIGNAL_NO_FEES_POLICY',
      category: 'legitimacy',
      severity: 'positive',
      weight: -20,
      label: {
        en: 'Explicit Zero-Fee Recruitment Policy',
        sn: 'Chitsidzo Chekusabhadharisa Mari Pabasa',
        nd: 'Isibopho Sokungabhadhali Imali Emsebenzini',
        _needsNativeSpeakerReview: true,
      },
      description: {
        en: 'The employer explicitly states a zero-fee policy in accordance with fair labor standards.',
        sn: 'Kambani inojekesa pachena kuti haibhadharisi mari yekutsvaga basa maererano nemitemo yenyika.',
        nd: 'Inkampani icacisa ukuthi kayibhadhisi mali yokuqhatshwa ngokulandela umthetho.',
        _needsNativeSpeakerReview: true,
      },
      matchedKeywords: ['no fees policy'],
    });
  }

  // B. Structured interview process with physical venue
  const structuredInterviewRegex = /\b(panel interview|in-person|practical test|coding test|aptitude test|physical workshop|boardroom|head office)\b/i;
  if (structuredInterviewRegex.test(lower)) {
    positiveSignals.push({
      id: 'SIGNAL_STRUCTURED_INTERVIEW_PROCESS',
      category: 'legitimacy',
      severity: 'positive',
      weight: -15,
      label: {
        en: 'Structured Multi-Stage Interview Process',
        sn: 'Hurongwa hwekubvunzurudzwa kwepamutemo (Panel/In-Person)',
        nd: 'Inhlelo Yokuhlolwa Ngokusemthethweni',
        _needsNativeSpeakerReview: true,
      },
      description: {
        en: 'Details structured selection stages (aptitude test, panel interview, physical orientation) rather than instant WhatsApp approval.',
        sn: 'Inopa ruzivo rwekubvunzurudzwa pamahofisi pachinzvimbo chekungotenderwa paWhatsApp pasina bvunzo.',
        nd: 'Ilesigaba senhlolokhono emahofisini hatshi ukuvunywa nje nge-WhatsApp.',
        _needsNativeSpeakerReview: true,
      },
    });
  }

  // C. Official Zimbabwean verified domain or verifiable landline
  const hasZimDomain = foundUrls.some((u) => OFFICIAL_ZIM_DOMAINS.some((d) => u.toLowerCase().includes(d))) ||
                       foundEmails.some((e) => OFFICIAL_ZIM_DOMAINS.some((d) => e.toLowerCase().includes(d)));
  if (hasZimDomain) {
    positiveSignals.push({
      id: 'SIGNAL_OFFICIAL_ZIM_DOMAIN',
      category: 'legitimacy',
      severity: 'positive',
      weight: -18,
      label: {
        en: 'Registered Zimbabwean Domain (.co.zw / .org.zw)',
        sn: 'Website Yakanyoreswa muZimbabwe (.co.zw / .org.zw)',
        nd: 'I-Website Ebhaliswe eZimbabwe (.co.zw / .org.zw)',
        _needsNativeSpeakerReview: true,
      },
      description: {
        en: 'Communication is routed through an established Zimbabwean second-level domain name registered under local regulatory oversight.',
        sn: 'Kushandiswa kwedomain repamutemo reZimbabwe rakanyoreswa pasi pemirairo yenyika.',
        nd: 'Ukusetshenziswa kwe-website ebhaliswe ngokusemthethweni eZimbabwe.',
        _needsNativeSpeakerReview: true,
      },
    });
  }

  // D. Verified Employer Match & Cryptographic Signature Check
  if (matchedEmployer) {
    const signatureWeight = employerSignatureValid ? -30 : 15;
    positiveSignals.push({
      id: 'SIGNAL_MATCHED_VERIFIED_EMPLOYER',
      category: 'legitimacy',
      severity: employerSignatureValid ? 'positive' : 'high',
      weight: signatureWeight,
      label: {
        en: employerSignatureValid
          ? `Verified Employer: ${matchedEmployer.name} (Cryptographically Validated)`
          : `Employer Tamper Alert: ${matchedEmployer.name} (Signature Mismatch)`,
        sn: employerSignatureValid
          ? `Mushandirwi Akanyoreswa: ${matchedEmployer.name} (Yakaongororwa neSignature)`
          : `Yambiro: Signature ya ${matchedEmployer.name} Yakashandurwa`,
        nd: employerSignatureValid
          ? `Umqhatshi Obhalisiweyo: ${matchedEmployer.name} (Kuvikelwe nge-Signature)`
          : `Isixwayiso: Isigxivizo sika ${matchedEmployer.name} Asiqondanga`,
        _needsNativeSpeakerReview: true,
      },
      description: {
        en: employerSignatureValid
          ? `Identified as a formal entity registered with Safe Jobs Shield. Web Crypto HMAC signature is cryptographically valid and untampered.`
          : `The entity name matches a registry record, but the cryptographic signature failed validation. Possible domain or contact spoofing.`,
        sn: employerSignatureValid
          ? `Kambani iyi iri muchirongwa cheSafe Jobs Shield. Signature yayo yemagetsi ndeyechokwadi uye haina kushandurwa.`
          : `Zita rekambani ririmo asi signature yakundikana. Chenjera kutevedzera vanhu vanonyepedzera.`,
        nd: employerSignatureValid
          ? `Le nkampani ibhalisiwe ku-Safe Jobs Shield. Isigxivizo sayo siqondile kanti asitshintshwanga.`
          : `Igama lenkampani likhona kodwa isigxivizo asiqondanga. Qaphela abaqili.`,
        _needsNativeSpeakerReview: true,
      },
    });
  }

  // If neither red flags nor verified positive indicators were triggered, return NOT_ENOUGH_INFO
  if (signals.length === 0 && positiveSignals.length === 0 && matchedEmployer === null) {
    return createNotEnoughInfoResult(redactedText, entities);
  }

  // ==========================================
  // SCORE CALCULATION (0 - 100)
  // ==========================================
  let totalScore = 0;

  for (const s of signals) {
    totalScore += s.weight;
  }
  for (const p of positiveSignals) {
    totalScore += p.weight;
  }

  // Base score normalizer
  if (signals.length === 0 && positiveSignals.length > 0) {
    totalScore = Math.max(5, Math.min(20, totalScore));
  } else if (signals.length > 0 && positiveSignals.length === 0) {
    totalScore = Math.max(35, totalScore);
  }

  // Keep within bounds 0 - 100
  totalScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  // If severe trafficking indicators triggered, lock to at least 80
  if (isEmergencyOrTrafficking) {
    totalScore = Math.max(82, totalScore);
  }

  // Determine Verdict
  let verdict: RiskVerdict = 'LOW_RISK';
  if (totalScore >= 70) {
    verdict = 'HIGH_RISK';
  } else if (totalScore >= 30) {
    verdict = 'SUSPICIOUS';
  } else {
    verdict = 'LOW_RISK';
  }

  // Action advice generation
  const actionAdvice = generateActionAdvice(verdict, isEmergencyOrTrafficking, signals, matchedEmployer);

  return {
    score: totalScore,
    verdict,
    verdictLabel: getVerdictLabel(verdict),
    summary: getVerdictSummary(verdict, signals.length, positiveSignals.length),
    signals,
    positiveSignals,
    actionAdvice,
    isEmergencyOrTrafficking,
    helplineInfo: isEmergencyOrTrafficking ? ZIM_TRAFFICKING_HELPLINE : undefined,
    redactedText,
    entities,
    matchedEmployer,
    employerSignatureValid,
    evaluationTimestamp: Date.now(),
  };
}

/**
 * Creates result for insufficient text (under 15 words, no obvious signals)
 */
function createNotEnoughInfoResult(redactedText: string, entities: ExtractedEntities): DetectionResult {
  return {
    score: 15,
    verdict: 'NOT_ENOUGH_INFO',
    verdictLabel: {
      en: 'NOT ENOUGH INFORMATION',
      sn: 'MASHOKO HAANA KUKWANA',
      nd: 'ULWAZI ALWENELANGA',
      _needsNativeSpeakerReview: true,
    },
    summary: {
      en: 'The provided text is too brief or lacks sufficient contact details to provide a conclusive defensive rating.',
      sn: 'Mashoko amaisa mapfupi zvikuru kana kuti haana ruzivo rwekubata kambani rwakakwana kuti titonge.',
      nd: 'Umbiko owufakileyo mncane kakhulu loba awula mininingwane eyeneleneyo yokwenza isinqumo.',
      _needsNativeSpeakerReview: true,
    },
    signals: [],
    positiveSignals: [],
    actionAdvice: {
      en: [
        'Ask the recruiter for the registered company name, company registration number, and official physical address.',
        'Request an official email address ending with .co.zw or the company domain rather than WhatsApp/Gmail.',
        'Never send advance application or processing fees, even if requested casually later.',
        'Paste the updated detailed job description back into Safe Jobs Shield once received.',
      ],
      sn: [
        'Kumbira mushandirwi zita rekambani rakanyoreswa, nenhamba yayo yehofisi chaiyo.',
        'Kumbira email yekambani (.co.zw) pane kungotaura paWhatsApp chete.',
        'Usambotuma mari yekubatsirwa kunyange vakaikumbira zvisina kurongwa.',
        'Dzokera pano uise tsanangudzo yakazara kana vangoikupa.',
      ],
      nd: [
        'Cela umqhatshi igama lenkampani elibhalisiweyo lendawo yamahofisi.',
        'Cela i-email yenkampani (.co.zw) kulokukhulumela ku-WhatsApp yodwa.',
        'Ungabhadhali imali yokufaka isicelo lanxa beyicela ngobunono.',
        'Buyela lapha uzofaka umbiko opheleleyo nxa sewuwutholile.',
      ],
    },
    isEmergencyOrTrafficking: false,
    redactedText,
    entities,
    matchedEmployer: null,
    employerSignatureValid: false,
    evaluationTimestamp: Date.now(),
  };
}

function hasHighRiskKeywords(text: string): boolean {
  return /\b(fee|fees|pay|ecocash|usd|bhadhara|deposit|passport|waist|measurements|dubai|pin|otp)\b/i.test(text);
}

function extractClaimedEmployers(text: string): string[] {
  const employers: string[] = [];
  const patterns = [
    /\b(Econet(?:\s+Wireless)?)\b/i,
    /\b(Delta(?:\s+Beverages)?)\b/i,
    /\b(OK(?:\s+Zimbabwe|\s+Mart)?)\b/i,
    /\b(TM(?:\s+Pick\s+n\s+Pay)?)\b/i,
    /\b(City\s+of\s+Harare)\b/i,
    /\b(United\s+Nations|UN\b)/i,
    /\b(ZimFresh\s+Agribusiness)\b/i,
    /\b(Zambezi\s+Digital\s+Solutions)\b/i,
    /\b(Harare\s+Logistics)\b/i,
    /\b(Matabeleland\s+Solar\s+Tech)\b/i,
    /\b(Batanai\s+Community\s+Health\s+Trust)\b/i,
  ];

  for (const p of patterns) {
    const match = text.match(p);
    if (match) {
      employers.push(match[0]);
    }
  }
  return employers;
}

function getVerdictLabel(verdict: RiskVerdict) {
  switch (verdict) {
    case 'LOW_RISK':
      return { en: 'LOW RISK', sn: 'NGOZI IDIKI', nd: 'INGOZI ENCANE', _needsNativeSpeakerReview: true };
    case 'SUSPICIOUS':
      return { en: 'SUSPICIOUS', sn: 'ZVINONYUMWISA', nd: 'KUSOLISEKILE', _needsNativeSpeakerReview: true };
    case 'HIGH_RISK':
      return { en: 'HIGH RISK', sn: 'NGOZI HURU', nd: 'INGOZI ENKULU', _needsNativeSpeakerReview: true };
    case 'NOT_ENOUGH_INFO':
      return { en: 'NOT ENOUGH INFO', sn: 'MASHOKO HAANA KUKWANA', nd: 'ULWAZI ALWENELANGA', _needsNativeSpeakerReview: true };
  }
}

function getVerdictSummary(verdict: RiskVerdict, signalCount: number, positiveCount: number) {
  switch (verdict) {
    case 'LOW_RISK':
      return {
        en: `Demonstrates verified institutional signals (${positiveCount} positive indicators) with standard corporate recruitment protocols.`,
        sn: `Inoratidza maitiro emakambani emutemo (${positiveCount} zviratidzo zvakanaka) pasina kukumbirwa mari.`,
        nd: `Ibonisa izitshengiso zenkampani esemthethweni (${positiveCount} izitshengiso ezinhle) ngaphandle kokubhadhaliswa imali.`,
        _needsNativeSpeakerReview: true,
      };
    case 'SUSPICIOUS':
      return {
        en: `Triggered ${signalCount} risk signals. Do not send deposits or private IDs until independently verified.`,
        sn: `Yabata zviratidzo zvingangoita ${signalCount} zvisina kumira zvakanaka. Usambotuma mari kusvikira waongorora zvakazara.`,
        nd: `Kutholakele izitshengiso zengozi ezingaba ngu-${signalCount}. Ungathumeli imali uze uqiniseke.`,
        _needsNativeSpeakerReview: true,
      };
    case 'HIGH_RISK':
      return {
        en: `Triggered ${signalCount} critical fraud indicators (advance fee, identity theft, or exploitation red flags). Extreme danger.`,
        sn: `Yabata zviratidzo zvehutsotsi zvakakura ${signalCount}. Ngozi huru yechitsotsi kana kutorwa nevanhu.`,
        nd: `Kutholakele izitshengiso zobuqili obukhulu ezingaba ngu-${signalCount}. Ingozi enkulu yobuqili.`,
        _needsNativeSpeakerReview: true,
      };
    case 'NOT_ENOUGH_INFO':
      return {
        en: 'Insufficient data for confident assessment.',
        sn: 'Mashoko haana kukwana kuita chisarudzo chakajeka.',
        nd: 'Ulwazi alwenelanga ukwenza isinqumo esiqinileyo.',
        _needsNativeSpeakerReview: true,
      };
  }
}

function generateActionAdvice(
  verdict: RiskVerdict,
  isEmergencyOrTrafficking: boolean,
  signals: SignalResult[],
  matchedEmployer?: VerifiedEmployer | null
) {
  if (isEmergencyOrTrafficking) {
    return {
      en: [
        'DO NOT send personal photos, body measurements, or surrender your passport.',
        'DO NOT accept unverified foreign travel arrangements or private flight tickets.',
        'Call the Zimbabwe National Anti-Trafficking & GBV Helpline immediately at toll-free 08080074.',
        'Confide in a trusted relative or local church/community counselor before taking any action.',
      ],
      sn: [
        'USATUMIRA mifananidzo yemuviri wako kana kupa passport yako kune chero munhu.',
        'USABVUMA tikiti rorwendo rwekunze rwusingazivikanwe.',
        'FONA mahara pa 08080074 (Helpline yeKudzivirira Hutapwa neMusasa Project).',
        'Taurira vabereki kana hama yaunovimba nayo usati waita chero danho.',
      ],
      nd: [
        'UNGATHUMELI izithombe zomzimba wakho loba ukunika ipasipoti yakho muntu.',
        'UNGAVUMI amathikithi endiza angaziwayo aya emazweni angaphandle.',
        'TSHAYELA ucingo lwamahhala 08080074 (Musasa Project / Anti-Trafficking Helpline).',
        'Tshela abazali loba abangane obathembayo ungakenzi lutho.',
      ],
    };
  }

  if (verdict === 'HIGH_RISK') {
    return {
      en: [
        'DO NOT pay any money via EcoCash, InnBucks, Mukuru, or bank transfer for registration, uniform, or badges.',
        'DO NOT forward bank card photos, OTP verification codes, or national identity documents.',
        'Block the recruiter on WhatsApp and report the phone number using the "Report a Scam" button below.',
        'Check legitimate youth job vacancies directly via our Verified Employers Directory.',
      ],
      sn: [
        'USAMBOBHADHARA mari paEcoCash, InnBucks kana Mukuru yekunyorwa basa kana uniform.',
        'USATUMIRA mifananidzo yekadhi rebhangi, OTP code kana gwaro rekuzvarwa.',
        'Vhara (block) munhu uyu paWhatsApp uye mhanara nhamba yake pano paSafe Jobs Shield.',
        'Tsvaka mabasa echokwadi pane zvinyorwa zveVashandirwi Vakanyoreswa.',
      ],
      nd: [
        'UNGABHADHALI imali nge-EcoCash, InnBucks loba Mukuru ye-uniform loba amabheji.',
        'UNGATHUMELI amakhadi e-bank, ama-OTP loba ipasipoti yakho.',
        'Vala (block) lo muntu ku-WhatsApp ubusumbika lapha ku-Safe Jobs Shield.',
        'Hlola imisebenzi yeqiniso kuluhlu lwabaQhatshi Ababhalisiweyo.',
      ],
    };
  }

  if (verdict === 'SUSPICIOUS') {
    return {
      en: [
        'Do not commit any money or disclose private financial credentials.',
        'Cross-check the company name against the official Registrar of Companies or call their verified landline.',
        'Request an in-person interview at a formal, public office building before sharing paperwork.',
        'Ask why they are using a free email provider (e.g., @gmail) if they represent a registered enterprise.',
      ],
      sn: [
        'Usambopa mari kana ruzivo rwemaakaundi ako.',
        'Ongorora kana kambani iyi yakanyoreswa zviri pamutemo kana kufonera nhamba yavo yepahofisi.',
        'Kumbira kuitirwa interview pahofisi inozivikanwa pachena usati watumira magwaro ako.',
        'Vabvunze chikonzero chavari kushandisa Gmail vachiti ikambani huru.',
      ],
      nd: [
        'Unganiki imali loba imininingwane yamabhange akho.',
        'Hlola ukuthi inkampani le ibhalisiwe ngokusemthethweni ngokutshayela ucingo lwamahofisi.',
        'Cela ukwenzelwa inhlolokhono emahofisini aqondileyo ungakaniki amaphepha akho.',
        'Babuze ukuthi kungani besebenzisa i-Gmail nxa beyinkampani enkulu.',
      ],
    };
  }

  // LOW RISK
  return {
    en: [
      matchedEmployer
        ? `Confirm you are applying directly via ${matchedEmployer.domain} or phone ${matchedEmployer.officialPhone}.`
        : 'Prepare a formal CV tailored to the advertised role requirements.',
      'Remember that even genuine employers should never ask for fees at later stages.',
      'Attend scheduled interviews at their verified physical premises or through official videoconferencing.',
      'Keep copies of all communication and your formal job contract.',
    ],
    sn: [
      matchedEmployer
        ? `Iva nechokwadi chekuti urikunyorera pa ${matchedEmployer.domain} kana runhare ${matchedEmployer.officialPhone}.`
        : 'Gadzirira CV yako yakarongeka inoenderana nebasa iri.',
      'Yeuka kuti kunyange mushandirwi wechokwadi haambokumbiri mari mberi.',
      'Enda kuinterview pamahofisi anozivikanwa pamazuva amakatenderana.',
      'Chengeta zvinyorwa zvekutaura kwenyu nechibvumirano chebasa (contract).',
    ],
    nd: [
      matchedEmployer
        ? `Qinisekisa ukuthi ufaka isicelo ku ${matchedEmployer.domain} loba ucingo ${matchedEmployer.officialPhone}.`
        : 'Lungisa i-CV yakho eqondileyo ehambelana lo msebenzi.',
      'Khumbula ukuthi umqhatshi weqiniso kaze acele imali ngomuso.',
      'Hamba kunhlolokhono emahofisini abo ngesikhathi esihleliweyo.',
      'Gcina amakhophi ezivumelwano zomsebenzi wakho (contract).',
    ],
  };
}

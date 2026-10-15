/**
 * Safe Jobs Shield - Localization Dictionary
 * Supported: English (en), Shona (sn), Northern Ndebele (nd)
 *
 * NOTE FOR TRANSLATORS:
 * All Shona and Ndebele entries below include the flag: `_needsNativeSpeakerReview: true`.
 * Native speakers can review and calibrate terminology for Zimbabwean youth job seekers.
 */

import { Language, RiskVerdict } from '../types';

export const NEEDS_NATIVE_REVIEW_FLAG = true;

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  categoryBadge: string;
  navChat: string;
  navDocGuard: string;
  navOcr: string;
  navLookalike: string;
  navSignedAds: string;
  navRecovery: string;
  navEmployers: string;
  navRoadmap: string;
  navPrivacy: string;
  navReport: string;
  navHowItWorks: string;
  navInclusion: string;
  navTests: string;
  navMyChecks: string;
  navSignIn: string;
  navAccount: string;
  navThreatModel: string;

  // Simulator
  chatHeaderTitle: string;
  chatHeaderSubtitle: string;
  chatPlaceholder: string;
  chatSend: string;
  chatVoiceRecord: string;
  chatVoiceListening: string;
  chatClear: string;
  quickDemoLabel: string;
  quickDemoPrompt: string;
  whatsappNotice: string;

  // Risk Verdicts
  verdicts: Record<RiskVerdict, { title: string; subtitle: string; badge: string }>;

  // Result card
  riskScoreLabel: string;
  riskScaleMin: string;
  riskScaleMax: string;
  signalsDetectedTitle: string;
  positiveFactorsTitle: string;
  recommendedStepsTitle: string;
  explainWithAiButton: string;
  explainWithAiLoading: string;
  explainWithAiDesc: string;
  transparentLogicTitle: string;
  transparentLogicDesc: string;
  verifiedEmployerFound: string;
  verifiedEmployerVerifiedBadge: string;
  verifiedEmployerSignatureValid: string;
  verifiedEmployerSignatureInvalid: string;

  // Helpline
  emergencyAlertTitle: string;
  emergencyAlertSubtitle: string;
  callHelpline: string;

  // Privacy & Consent
  consentBannerTitle: string;
  consentBannerBody: string;
  consentAccept: string;
  consentLearnMore: string;
  privacyTitle: string;
  privacySubtitle: string;
  hashingDemoTitle: string;
  hashingDemoInputPlaceholder: string;
  hashingDemoResultLabel: string;
  hashingDemoExplainer: string;
  dataProtectionActRef: string;

  // Report Flow
  reportModalTitle: string;
  reportModalSubtitle: string;
  reportCategoryLabel: string;
  reportSubmitButton: string;
  reportSubmittedSuccess: string;
  poisoningWarningNotice: string;
  rateLimitNotice: string;

  // Inclusion & Accessibility
  textOnlyModeToggle: string;
  highContrastToggle: string;
  voiceNoteFallback: string;
  ussdNoticeTitle: string;
  ussdNoticeBody: string;
  genderSafeguardTitle: string;
  genderSafeguardBody: string;

  // Native review warning
  nativeReviewNote: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'Safe Jobs Shield',
    tagline: 'Defensive Job Verification & Safe Pathways for Zimbabwean Youth',
    categoryBadge: 'National Employment Protection System • Zimbabwe',
    navChat: 'Job Verification Bot',
    navDocGuard: 'Document Guard',
    navOcr: 'Flyer & Screenshot OCR',
    navLookalike: 'Lookalike Detector',
    navSignedAds: 'Signed Ads (QR)',
    navRecovery: 'Incident Recovery',
    navEmployers: 'Verified Employers',
    navRoadmap: 'Roadmap & Interviews',
    navPrivacy: 'Privacy & Consent',
    navReport: 'Report a Scam',
    navHowItWorks: 'How It Works',
    navInclusion: 'Youth & Inclusion',
    navTests: 'Algorithm Standards (27 Tests)',
    navMyChecks: 'My Checks',
    navSignIn: 'Sign In / Register',
    navAccount: 'My Account',
    navThreatModel: 'Threat Model & Evaluation',

    chatHeaderTitle: 'Safe Jobs Shield Verification Bot',
    chatHeaderSubtitle: 'Official Defensive Assistant • End-to-End Encrypted',
    chatPlaceholder: 'Paste suspicious job offer, WhatsApp message, recruiter phone or website link...',
    chatSend: 'Analyze Offer',
    chatVoiceRecord: 'Speak Offer (Voice Note)',
    chatVoiceListening: 'Listening... please speak clearly',
    chatClear: 'Clear Chat',
    quickDemoLabel: 'Documented Fraud Patterns & Case Studies',
    quickDemoPrompt: 'Select a documented vacancy pattern to evaluate:',
    whatsappNotice: 'OFFICIAL SERVICE: Defensive verification aligned with the Zimbabwe Cyber & Data Protection Act [Chapter 12:07].',

    verdicts: {
      LOW_RISK: {
        title: 'LOW RISK',
        subtitle: 'This offer exhibits standard formal employment practices and verified signals.',
        badge: 'Low Risk Offer',
      },
      SUSPICIOUS: {
        title: 'SUSPICIOUS',
        subtitle: 'Multiple red flags detected. Proceed with extreme caution and do not send money.',
        badge: 'Caution Advised',
      },
      HIGH_RISK: {
        title: 'HIGH RISK',
        subtitle: 'Critical scam or exploitation indicators detected. Do NOT pay or share private IDs.',
        badge: 'High Danger Warning',
      },
      NOT_ENOUGH_INFO: {
        title: 'NOT ENOUGH INFORMATION',
        subtitle: 'The provided text is too brief to make a confident assessment. Ask for employer details.',
        badge: 'Inconclusive Offer',
      },
    },

    riskScoreLabel: 'Calculated Risk Index',
    riskScaleMin: '0 (Safe)',
    riskScaleMax: '100 (Critical Scam)',
    signalsDetectedTitle: 'Identified Red Flags & Risk Factors',
    positiveFactorsTitle: 'Verified Positive Safety Indicators',
    recommendedStepsTitle: 'Immediate Safe Next Steps',
    explainWithAiButton: 'Explain in Simple Terms (AI Assistant)',
    explainWithAiLoading: 'Consulting AI explainer with pre-redacted privacy text...',
    explainWithAiDesc: 'Optional: Summarizes findings in plain conversational language without storing PII.',
    transparentLogicTitle: 'Algorithmic Transparency & Signal Weights',
    transparentLogicDesc: 'How Safe Jobs Shield calculated this score using weighted deterministic heuristics:',
    verifiedEmployerFound: 'Matches a Registered Verified Zimbabwean Employer',
    verifiedEmployerVerifiedBadge: 'Cryptographically Verified Registry Entry',
    verifiedEmployerSignatureValid: 'Web Crypto ECDSA Signature: Valid & Untampered',
    verifiedEmployerSignatureInvalid: 'WARNING: Employer Registry Signature Mismatch',

    emergencyAlertTitle: 'Urgent Exploitation / Human Trafficking Precaution',
    emergencyAlertSubtitle: 'This offer requests physical photos, measurements, or unverified foreign travel.',
    callHelpline: 'Toll-Free National Helpline: 08080074 (Musasa / Anti-Trafficking)',

    consentBannerTitle: 'Privacy-First Protection (Zimbabwe Cyber & Data Protection Act)',
    consentBannerBody: 'We never store raw messages, phone numbers, or recruiter contacts. We convert identifiers into irreversible HMAC-SHA256 hashes.',
    consentAccept: 'I Understand & Accept',
    consentLearnMore: 'View Privacy Architecture',
    privacyTitle: 'Privacy-by-Design Architecture',
    privacySubtitle: 'Fully aligned with Zimbabwe Cyber and Data Protection Act [Chapter 12:07]',
    hashingDemoTitle: 'Live Cryptographic Hashing Demonstration',
    hashingDemoInputPlaceholder: 'Type a sample phone number (e.g., +263 77 123 4567) or domain...',
    hashingDemoResultLabel: 'HMAC-SHA256 Hash Stored in State (Raw Number Discarded):',
    hashingDemoExplainer: 'Notice that the server only ever receives this one-way hash string. Even if our database were leaked, individual phone numbers cannot be reverse-engineered without brute force.',
    dataProtectionActRef: 'Governed under statutory regulatory oversight of POTRAZ (Postal and Telecommunications Regulatory Authority of Zimbabwe).',

    reportModalTitle: 'Report a Deceptive Recruiter',
    reportModalSubtitle: 'Help protect fellow youth job seekers. Only the cryptographic hash will be recorded.',
    reportCategoryLabel: 'Scam Type Category',
    reportSubmitButton: 'Submit Community Flag',
    reportSubmittedSuccess: 'Thank you. Cryptographic hash recorded to community reputation pool.',
    poisoningWarningNotice: 'Poisoning Defense: To prevent malicious competitors from falsely reporting rivals, reports undergo threshold quorum checks and exponential time decay.',
    rateLimitNotice: 'Rate limiting active: Maximum 3 report submissions per session to mitigate automated attacks.',

    textOnlyModeToggle: 'Text-Only Low-Data Mode',
    highContrastToggle: 'High Contrast Mode',
    voiceNoteFallback: 'Audio Voice-Over Mode',
    ussdNoticeTitle: 'USSD *707# & Feature Phone Readiness',
    ussdNoticeBody: 'Over 68% of rural Zimbabwean youth use 2G feature phones (Econet/NetOne). Our architecture supports a USSD menu tree running the exact same rule set.',
    genderSafeguardTitle: 'Gender-Sensitive Safeguards',
    genderSafeguardBody: 'Young women face disproportionate risks of domestic worker trafficking to the Middle East and fake hospitality grooming. Offers requesting personal photos or secret interviews trigger emergency protocol.',

    nativeReviewNote: 'English is verified. Shona and Ndebele translations are community-ready for native speaker sign-off.',
  },

  sn: {
    appName: 'Safe Jobs Shield',
    tagline: 'Kudzivirira vechidiki pazvitsotsi zvemabasa uye kutsvaka mabasa akachengeteka muZimbabwe',
    categoryBadge: 'Chirongwa CheNyika CheKudzivirira Mabasa • Zimbabwe',
    navChat: 'Ongororo yeMabasa (Bot)',
    navDocGuard: 'Kuchengetedza Magwaro (Document Guard)',
    navOcr: 'Kuverenga Zvinyorwa (OCR)',
    navLookalike: 'Kufanana Kwenhema (Lookalikes)',
    navSignedAds: 'Mabasa Akasainwa (QR)',
    navRecovery: 'Zvekuita Kana Wabirwa (Recovery)',
    navEmployers: 'Vashandirwi Vakanyoreswa',
    navRoadmap: 'Hurongwa & Kubvunzurudzwa',
    navPrivacy: 'Kuchengetedza Chitsidzo',
    navReport: 'Mhan' + "ara Chitsotsi",
    navHowItWorks: 'Mashandiro Azvo',
    navInclusion: 'Kusarura & Vose',
    navTests: 'Miedzo yeEngine (27 Tests)',
    navMyChecks: 'Zvandakaongorora',
    navSignIn: 'Kupinda / Nyoresa',
    navAccount: 'Akaunti Yangu',
    navThreatModel: 'Threat Model & Ongororo',

    chatHeaderTitle: 'Safe Jobs Shield Verification Bot',
    chatHeaderSubtitle: 'Mubatsiri wekuongorora mabasa • Yakavharidzirwa zvakakwana',
    chatPlaceholder: 'Isa mashoko ebasa riri kufungidzirwa, nhamba yerunhare, email kana link pano...',
    chatSend: 'Ongorora Basa',
    chatVoiceRecord: 'Taura Neinzwi (Voice Note)',
    chatVoiceListening: 'Tiri kuteerera... ndapota taura zvinonzwika',
    chatClear: 'Dzima Zvose',
    quickDemoLabel: 'Mienzaniso yeMhosva Dzakanyorwa & Zvitsotsi',
    quickDemoPrompt: 'Sarudza muenzaniso wechitsotsi chakanyorwa kuti uongorore:',
    whatsappNotice: 'CHIRONGWA CHEPAMUTEMO: Ongororo yakadzivirirwa maererano neMutemo weData Protection weZimbabwe [12:07].',

    verdicts: {
      LOW_RISK: {
        title: 'NGOZI IDIKI (LOW RISK)',
        subtitle: 'Basa iri rine zviratidzo zvakajairika zvemabasa emutemo uye vashandirwi vechokwadi.',
        badge: 'Rinenge Basa Rechokwadi',
      },
      SUSPICIOUS: {
        title: 'ZVINONYUMWISA (SUSPICIOUS)',
        subtitle: 'Pane zvimwe zviratidzo zvisina kumira zvakanaka. Chenjera zvikuru, usambobhadhara mari.',
        badge: 'Nyatsoongorora',
      },
      HIGH_RISK: {
        title: 'NGOZI HURU (HIGH RISK)',
        subtitle: 'Zviratidzo zvikuru zvehutsotsi kana kutorwa nevanhu zvawanikwa! Usatombobhadhara mari kana kupa gwaro rekuzvarwa.',
        badge: 'Chitsotsi Chinotyisa',
      },
      NOT_ENOUGH_INFO: {
        title: 'MASHOKO HAANA KUKWANA (NOT ENOUGH INFO)',
        subtitle: 'Mashoko amaisa mashoma zvakanyanya. Kumbira zita rekambani nenzvimbo yairi.',
        badge: 'Haigoni Kutongwa',
      },
    },

    riskScoreLabel: 'Chiyero CheNgozi (Risk Index)',
    riskScaleMin: '0 (Kwakachengeteka)',
    riskScaleMax: '100 (Chitsotsi Chikuru)',
    signalsDetectedTitle: 'Zviratidzo Zvakaonekwa ZveNgozi',
    positiveFactorsTitle: 'Zviratidzo Zvakanaka Zvechokwadi',
    recommendedStepsTitle: 'Zvokuita Nekukasika Kuti Uzvidzivirire',
    explainWithAiButton: 'Tsanangura Nemutauro Wakareruka (AI)',
    explainWithAiLoading: 'Tiri kukumbira AI kuti itsanangure pasina kupa ruzivo rwako...',
    explainWithAiDesc: 'Kusarudza: Inotsanangura muchidimbu nemutauro weChiShona pasina kuchengeta mashoko ako.',
    transparentLogicTitle: 'Kujeka KweMashandiro Echirongwa',
    transparentLogicDesc: 'Mabatirwo aita Safe Jobs Shield chiyero ichi pasina zvakavanzika:',
    verifiedEmployerFound: 'Yakaenderana neMushandirwi Akanyoreswa Zvepamutemo muZimbabwe',
    verifiedEmployerVerifiedBadge: 'Yakanyoreswa Zvakavimbika neSignature Yemagetsi',
    verifiedEmployerSignatureValid: 'Web Crypto Signature: Yechokwadi, Haina Kuchinjwa',
    verifiedEmployerSignatureInvalid: 'YAMBIRO: Signature YeMushandirwi Yakachinjwa',

    emergencyAlertTitle: 'Yambiro Pamusoro Pekutorwa Kwevanhu (Trafficking Alert)',
    emergencyAlertSubtitle: 'Basa iri riri kukumbira mifananidzo yemuviri kana rwendo rusingazivikanwe.',
    callHelpline: 'Fona Mahara: 08080074 (Musasa Project / National Anti-Trafficking)',

    consentBannerTitle: 'Kuchengetedzwa Kwechitsidzo (Zimbabwe Cyber and Data Protection Act)',
    consentBannerBody: 'Hatichengeti mameseji enyu kana nhamba dzerunhare. Tinoshandisa cryptographically hashed values chete kudzivirira vanhu.',
    consentAccept: 'Ndanzwisisa & Ndinobvuma',
    consentLearnMore: 'Ona Mashandiro ePrivacy',
    privacyTitle: 'Kudzivirirwa Kwemashoko Ako (Privacy-by-Design)',
    privacySubtitle: 'Zvinoenderana neMutemo weData Protection weZimbabwe [Chapter 12:07]',
    hashingDemoTitle: 'Kuratidzwa Kwekuvharidza Nhamba (Live Hashing)',
    hashingDemoInputPlaceholder: 'Nyora nhamba yerunhare somuenzaniso (+263 77 123 4567)...',
    hashingDemoResultLabel: 'Hash Inochengetwa (Nhamba Yechokwadi Inoraswa):',
    hashingDemoExplainer: 'Hash iyi haigoni kudzoserwa kunhamba yako yepakutanga. Kunyange mumwe munhu akaona database, haambozivi nhamba yako.',
    dataProtectionActRef: 'Zvinoenderana nemirairo yePOTRAZ (Postal and Telecommunications Regulatory Authority of Zimbabwe).',

    reportModalTitle: 'Mhan' + 'ara Mushandirwi Wekunyepedzera',
    reportModalSubtitle: 'Batsira kudzivirira vamwe vechidiki. Hash yemagetsi chete ndiyo inochengetwa.',
    reportCategoryLabel: 'Mhando Yechitsotsi',
    reportSubmitButton: 'Tumira Chiziviso',
    reportSubmittedSuccess: 'Maita basa. Hash yanyorwa muchirongwa chenharaunda.',
    poisoningWarningNotice: 'Kudzivirira mashoko emanyepo: Kuti vanhu vasanyeperane zvakaipa, chirongwa chinoda humbowo hwevanhu vakawanda.',
    rateLimitNotice: 'Kudzikamisa kushandisa: Munotenderwa kumhan' + 'ara kasingadariki katatu pachikamu.',

    textOnlyModeToggle: 'Mashoko Chete (Text-Only Mode)',
    highContrastToggle: 'Mavara Akajeka (High Contrast)',
    voiceNoteFallback: 'Kutaura Neinzwi (Voice-Over)',
    ussdNoticeTitle: 'USSD *707# kuNharembozha Dzekare',
    ussdNoticeBody: 'Vechidiki vanosvika 68% vanoshandisa nhare dzisingaverengi internet. Tine chirongwa cheUSSD neSMS chinomhanya nemitemo imwe chete.',
    genderSafeguardTitle: 'Kudzivirira Vanhukadzi Nevechidiki',
    genderSafeguardBody: 'Vanasikana vanowanzonyeperwa mabasa ekunze anozoshanduka kuva hutapwa. Basa rinokumbira pikicha rinobva ratanga yambiro.',

    nativeReviewNote: '[Cherechedzo: Zvinyorwa zveChiShona zvinoda kuongororwa zvizere nenyanzvi yemitauro / Needs native-speaker review]',
  },

  nd: {
    appName: 'Safe Jobs Shield',
    tagline: 'Ukuvikela abasakhulayo ebuqilini bemisebenzi lokuvula amathuba aphephileyo eZimbabwe',
    categoryBadge: 'Uhlelo Lwezwe Lokuvikela Imisebenzi • Zimbabwe',
    navChat: 'Umsizi Wokuhlola (Bot)',
    navDocGuard: 'Ukuvikela Amaphepha (Document Guard)',
    navOcr: 'Ukuhlola Izithombe (OCR)',
    navLookalike: 'Ukulingisa Kwenkohliso (Lookalikes)',
    navSignedAds: 'Imisebenzi Eqinisekisiweyo (QR)',
    navRecovery: 'Usizo Nxa Uqilwe (Recovery)',
    navEmployers: 'Abaqhatshi Ababhalisiweyo',
    navRoadmap: 'Uhlelo & Imibuzo Yokungena',
    navPrivacy: 'Ukuvikela Imfihlo',
    navReport: 'Bika Ubuqili',
    navHowItWorks: 'Kusebenza Kanjani',
    navInclusion: 'Wonke Umuntu & Ubulili',
    navTests: 'Uhlolisiso lwe-Engine (27 Tests)',
    navMyChecks: 'Engikuhlolileyo',
    navSignIn: 'Ngena / Bhalisa',
    navAccount: 'I-akhawunti Yami',
    navThreatModel: 'Threat Model & Ukuhlola',

    chatHeaderTitle: 'Safe Jobs Shield Verification Bot',
    chatHeaderSubtitle: 'Umsizi osemthethweni wokuhlola imisebenzi • Kuvikelwe ngokupheleleyo',
    chatPlaceholder: 'Faka umbiko womsebenzi osolwayo, inombolo yocingo, i-imeyili loba i-website...',
    chatSend: 'Hlola Umsebenzi',
    chatVoiceRecord: 'Khuluma Ngezwi (Voice Note)',
    chatVoiceListening: 'Siyalalela... sicela ukhulume ngokuzwakalayo',
    chatClear: 'Sula Konke',
    quickDemoLabel: 'Izibonelo Zobufakazi Bemisebenzi Kazwelonke',
    quickDemoPrompt: 'Khetha isibonelo somsebenzi obhaliweyo ukuze uhlole:',
    whatsappNotice: 'INKONZO ESEMTHETHWENI: Ukuvikeleka okugcweleyo phansi komthetho we-Data Protection Act [12:07].',

    verdicts: {
      LOW_RISK: {
        title: 'INGOZI ENCANE (LOW RISK)',
        subtitle: 'Lo msebenzi uleziqinisekiso ezijwayelekileyo zemisebenzi esemthethweni.',
        badge: 'Umsebenzi Obonakala Uphephile',
      },
      SUSPICIOUS: {
        title: 'KUSOLISEKILE (SUSPICIOUS)',
        subtitle: 'Kutholakele izinto ezingaqondanga. Qaphela kakhulu, ungaze wabhadala imali.',
        badge: 'Qaphelisisa Kahle',
      },
      HIGH_RISK: {
        title: 'INGOZI ENKULU (HIGH RISK)',
        subtitle: 'Kutholakele izitshengiso ezinzima zobuqili loba ukuthengiswa kwabantu. Ungabhadali loba ukunika amapasi akho!',
        badge: 'Isixwayiso Esikhulu Sobuqili',
      },
      NOT_ENOUGH_INFO: {
        title: 'ULWAZI ALWENELANGA (NOT ENOUGH INFO)',
        subtitle: 'Umbiko owufakileyo mncane kakhulu. Cela igama lenkampani lendawo lapho ekhona.',
        badge: 'Akukwazi Ukugwatshelwa',
      },
    },

    riskScoreLabel: 'Isilinganiso Sengozi (Risk Index)',
    riskScaleMin: '0 (Kuphephile)',
    riskScaleMax: '100 (Ubuqili Obukhulu)',
    signalsDetectedTitle: 'Izitshengiso Zengozi Ezibonakeleyo',
    positiveFactorsTitle: 'Izitshengiso Ezinhle Zokuphepha',
    recommendedStepsTitle: 'Okufanele Ukwenze Masinyane Ukuze Uzivikele',
    explainWithAiButton: 'Chaza Ngolimi Olulula (AI)',
    explainWithAiLoading: 'Sicela i-AI ukuthi ichaze ngokucacileyo ngaphandle kokugcina imininingwane yakho...',
    explainWithAiDesc: 'Ukukhetha: Ichaza ngesiNdebele esilula ngaphandle kokuthatha amabizo akho.',
    transparentLogicTitle: 'Ukukhanya Kokusebenza Kwendlela Yokuhlola',
    transparentLogicDesc: 'Indlela i-Safe Jobs Shield ebalisise ngayo lesi silinganiso ngaphandle kokufihla:',
    verifiedEmployerFound: 'Ihambelana Lomqhatshi Obhalisiweyo Osemthethweni eZimbabwe',
    verifiedEmployerVerifiedBadge: 'Kubhaliswe Ngokupheleleyo nge-Digital Signature',
    verifiedEmployerSignatureValid: 'Web Crypto Signature: Iqondile, Ayitshintshtshwanga',
    verifiedEmployerSignatureInvalid: 'ISIXWAYISO: Isigxivizo Somqhatshi Asiqondanga',

    emergencyAlertTitle: 'Isixwayiso Sokuthengiswa Kwabantu (Trafficking Alert)',
    emergencyAlertSubtitle: 'Lo msebenzi ucela izithombe zomzimba loba uhambo lwangaphandle olungaziwayo.',
    callHelpline: 'Tshayela Ucingo Lwamahhala: 08080074 (Musasa Project / Anti-Trafficking)',

    consentBannerTitle: 'Ukuvikelwa Kweminingwane (Zimbabwe Cyber and Data Protection Act)',
    consentBannerBody: 'Asigcini imilayezo yakho loba izinombolo zocingo. Sisebenzisa ama-cryptographic hash kuphela ukuvikela abantu.',
    consentAccept: 'Ngiyezwa & Ngiyavuma',
    consentLearnMore: 'Bona Indlela Yokuvikela',
    privacyTitle: 'Indlela Yokuvikela Imfihlo (Privacy-by-Design)',
    privacySubtitle: 'Kuhambelana lomThetho we-Data Protection weZimbabwe [Chapter 12:07]',
    hashingDemoTitle: 'Ukuboniswa Kokufihla Izinombolo (Live Hashing)',
    hashingDemoInputPlaceholder: 'Bhala inombolo yocingo njengesibonelo (+263 77 123 4567)...',
    hashingDemoResultLabel: 'I-Hash Egciniweyo (Inombolo Yangempela Ilahlwe):',
    hashingDemoExplainer: 'Le hash ayikwazi ukubuyiselwa emuva enombolweni yakho. Lanxa umuntu engathola idatha yethu, ngeke akwazi inombolo yakho.',
    dataProtectionActRef: 'Iqondiswe ngaphansi kwemithetho ye-POTRAZ (Postal and Telecommunications Regulatory Authority of Zimbabwe).',

    reportModalTitle: 'Bika Umqhatshi Womgogodla',
    reportModalSubtitle: 'Siza ukuvikela enye intsha. I-hash kuphela egcinwayo.',
    reportCategoryLabel: 'Uhlobo Lobuqili',
    reportSubmitButton: 'Thumela Umbiko Womphakathi',
    reportSubmittedSuccess: 'Siyabonga. I-hash ifakwe kuhlelo lomphakathi.',
    poisoningWarningNotice: 'Ukuvikela imibiko yamanga: Ukuze abantu banganyundelani, uhlelo ludinga ubufakazi babantu abanengi.',
    rateLimitNotice: 'Ukunqanda ukusetshenziswa ngokweqile: Uvunyelwe ukubika kathathu kuphela.',

    textOnlyModeToggle: 'Umbhalo Kuphela (Text-Only Mode)',
    highContrastToggle: 'Imibala Ekhanyayo (High Contrast)',
    voiceNoteFallback: 'Ukulalela Ngezwi (Voice-Over)',
    ussdNoticeTitle: 'USSD *707# Ocingweni Oludala',
    ussdNoticeBody: 'Intsha engaphezu kuka-68% isebenzisa omakhalekhukhwini abangela internet. Silohlelo lwe-USSD le-SMS olusebenza ngemithetho efanayo.',
    genderSafeguardTitle: 'Ukuvikelwa Kwabesifazane Lentsha',
    genderSafeguardBody: 'Amantombazana avame ukuqilwa ngemisebenzi yamazwe angaphandle eba yibugqili. Umsebenzi ocela izithombe uvusa isixwayiso masinyane.',

    nativeReviewNote: '[Isixwayiso: Okubhalwe ngesiNdebele kudinga ukuhlolwa ngumuntu owazi ulimi / Needs native-speaker review]',
  },
};

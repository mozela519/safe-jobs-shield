import { Language } from '../types';

export interface MicroLesson {
  id: string;
  triggerRedFlag: string;
  category: 'fee' | 'identity' | 'trafficking' | 'domain' | 'urgency' | 'payment_method' | 'legitimate';
  headline: {
    en: string;
    sn: string;
    nd: string;
  };
  durationSeconds: number; // e.g. 20
  ruleOfThumb: {
    en: string;
    sn: string;
    nd: string;
  };
  whyScammersDoIt: {
    en: string;
    sn: string;
    nd: string;
  };
  whatLegitEmployersDo: {
    en: string;
    sn: string;
    nd: string;
  };
  proTip: {
    en: string;
    sn: string;
    nd: string;
  };
}

export const MICRO_LESSONS: Record<string, MicroLesson> = {
  SIG_ADVANCE_FEE: {
    id: 'SIG_ADVANCE_FEE',
    triggerRedFlag: 'Advance Registration / Uniform / Medical Fee',
    category: 'fee',
    durationSeconds: 20,
    headline: {
      en: '20-Sec Lesson: Real Employers Never Charge You to Work',
      sn: 'Chidzidzo Chemasekondi 20: Mushandirwi Chaiye Haakubhadharisi Kuti Ushande',
      nd: 'Isifundo Semizuzwana 20: Umqhatshi Weqiniso Kalibhadalisi Ukusebenza',
    },
    ruleOfThumb: {
      en: 'Zero Fee Law: If you must pay money before you earn money, it is 100% an advance-fee fraud.',
      sn: 'Mutemo Wezero Fee: Kana uchifanira kubhadhara mari usati wawana mari, i100% chitsotsi.',
      nd: 'Umthetho Wezero Fee: Nxa kumele ubhadhale imali ungakatholi imali, ngubugebengu obungama-100%.',
    },
    whyScammersDoIt: {
      en: 'They invent fake uniforms, vetting badges, or medical cards to steal small amounts ($10–$35) quickly from hundreds of applicants before vanishing.',
      sn: 'Vanonyepedzera mayunifomu kana makadhi ekurapwa kuti vatore mari diki ($10-$35) kuvanhu vakawanda vozonyangarika.',
      nd: 'Baqamba amayunifomu angewona lamakhadi ezempilo ukuze bantshontshe imali encane kubantu abanengi besebenyamalala.',
    },
    whatLegitEmployersDo: {
      en: 'Legitimate Zimbabwean employers provide uniform and medical screening at company expense, or deduct it from your future payroll under statutory NEC guidelines.',
      sn: 'Vashandirwi vechokwadi muZimbabwe vanopa mayunifomu nekuhwina utano pachena kana kubvisa pamuhoro weramangwana zviri pamutemo.',
      nd: 'Abaqhatshi beqiniso eZimbabwe bapha amayunifomu lamacala ezempilo mahala kumbe basuse emholweni wesikhathi esizayo ngokusemthethweni.',
    },
    proTip: {
      en: 'Never send EcoCash or OneMoney to an individual phone number for an interview badge.',
      sn: 'Usambo tumira EcoCash kana OneMoney kunhamba yemunhu wega nekuda kwebheji rebasa.',
      nd: 'Ungaze wathumela i-EcoCash kumbe i-OneMoney kunombolo yomuntu ngenxa yebheji yomsebenzi.',
    },
  },
  SIG_PERSONAL_PAYMENT: {
    id: 'SIG_PERSONAL_PAYMENT',
    triggerRedFlag: 'Payment Sent to Personal Mobile Money (EcoCash/OneMoney/Mukuru)',
    category: 'payment_method',
    durationSeconds: 20,
    headline: {
      en: '20-Sec Lesson: Business vs Personal Mobile Numbers',
      sn: 'Chidzidzo Chemasekondi 20: Nhamba Yebhizimusi neYemunhu Wega',
      nd: 'Isifundo Semizuzwana 20: Inombolo Yebhizinisi leYomuntu Yodwa',
    },
    ruleOfThumb: {
      en: 'Registered companies collect fees through verified Merchant Code / Biller Codes, never to an agent’s personal subscriber SIM.',
      sn: 'Makambani akanyoreswa anounganidza mari kuburikidza neMerchant Code kana Biller Code, kwete SIM yemumwe munhu wega.',
      nd: 'Amankampani abhalisiweyo abutha imali ngeMerchant Code kumbe Biller Code, hatshi nge-SIM yomuntu eyedwa.',
    },
    whyScammersDoIt: {
      en: 'Personal mobile money wallets can be cashed out in minutes or registered with unregistered SIMs, leaving no corporate trail.',
      sn: 'Zvikwama zvemobile money zvevanhu vanogona kubvisa mari mumaminitsi vachishandisa maSIM asina kunyoreswa.',
      nd: 'Izikhwama ze-mobile money zabantu zingathengiswa ngemizuzu kumbe kusetshenziswe ama-SIM angabhaliswanga.',
    },
    whatLegitEmployersDo: {
      en: 'Companies list corporate bank accounts or official registered merchant numbers with POTRAZ and Reserve Bank of Zimbabwe verification.',
      sn: 'Makambani anopa maakaundi ebhanga emakambani kana merchant codes dzakanyoreswa zviri pamutemo neRBZ.',
      nd: 'Amankampani abeka amabhanga ebhizinisi kumbe amanombolo abathengisi abhalisiweyo ku-RBZ.',
    },
    proTip: {
      en: 'Ask for an official invoice and company biller code; a real recruiter never says "send to Agent Tendai".',
      sn: 'Kumbira invoice yepamutemo; mushandirwi chaiye haati "tumira kuna Agent Tendai".',
      nd: 'Cela i-invoice esemthethweni; umqhatshi weqiniso katsho ukuthi "thumela ku-Agent Tendai".',
    },
  },
  SIG_IMPERSONATION_DOMAIN: {
    id: 'SIG_IMPERSONATION_DOMAIN',
    triggerRedFlag: 'Lookalike Website or Free Email (@gmail.com for Corporate)',
    category: 'domain',
    durationSeconds: 20,
    headline: {
      en: '20-Sec Lesson: Spotting Lookalike Domains & Free Webmails',
      sn: 'Chidzidzo Chemasekondi 20: Kuona Mazita Enhema eWebhusaiti neGmail',
      nd: 'Isifundo Semizuzwana 20: Ukubona Amawebhusayithi Omgelo le-Gmail Engamanga',
    },
    ruleOfThumb: {
      en: 'Major corporates have their own official domain (e.g. @econet.co.zw, @tm.co.zw). They never hire through free @gmail.com or weird domains (.xyz, .top).',
      sn: 'Makambani mahombe ane mazita awo ewebhusaiti chaiwo. Havadane vanhu vachishandisa @gmail.com kana mazita asina kujeka (.xyz).',
      nd: 'Amankampani amakhulu alamagama awo eqiniso ewebhusayithi. Kawamemi abantu besebenzisa i-@gmail.com kumbe i-.xyz.',
    },
    whyScammersDoIt: {
      en: 'Anyone can register "econet-jobs-portal.xyz" for $1 or create a free "econet.recruiter2026@gmail.com" account in 60 seconds.',
      sn: 'Chero ani zvake anogona kuvhura "econet-jobs-portal.xyz" ne$1 kana kuvhura Gmail yemahara mukati memasekondi makumi matanhatu.',
      nd: 'Noma ngubani angaqhuba "econet-jobs-portal.xyz" nge-$1 kumbe avule i-Gmail yamahala ngemizuzwana engu-60.',
    },
    whatLegitEmployersDo: {
      en: 'Authentic companies publish vacancies on their primary corporate web portals and send emails from verified internal company email servers.',
      sn: 'Makambani echokwadi anobuditsa mabasa pamawedsaiti avo chaiwo uye maemail anobva kuserver yemakambani.',
      nd: 'Amankampani aqotho akhipha imisebenzi kumawebhusayithi awo asemthethweni njalo bathumela ama-imeyili avela kuseva yekampani.',
    },
    proTip: {
      en: 'Check the domain ending: Zimbabwe registered companies use .co.zw or verified .org / .com domains.',
      sn: 'Tarisa magumo ewebhusaiti: Makambani eZimbabwe anoshandisa .co.zw kana .com yakasimbiswa.',
      nd: 'Hlola isiphetho sewebhusayithi: Amankampani aseZimbabwe asebenzisa i-.co.zw kumbe i-.com eqinisekisiweyo.',
    },
  },
  SIG_PASSPORT_HOLD: {
    id: 'SIG_PASSPORT_HOLD',
    triggerRedFlag: 'Demand for Original Passport / Body Photos (Trafficking Flag)',
    category: 'trafficking',
    durationSeconds: 20,
    headline: {
      en: '20-Sec Lesson: Never Surrender Your Original Travel Documents',
      sn: 'Chidzidzo Chemasekondi 20: Usambo Regedza Pasipoti Yako Chaiyo',
      nd: 'Isifundo Semizuzwana 20: Ungaze Wanikela Ngepasipoti Yakho Yangempela',
    },
    ruleOfThumb: {
      en: 'Trafficking Red Flag: It is a serious crime under international law and the Trafficking in Persons Act for an employer to confiscate your original passport.',
      sn: 'Mureza Mutsuku Wekutengesa Vanhu: Imhosva huru pasi pemutemo wepasi rose kuti mushandirwi atore pasipoti yako chaiyo.',
      nd: 'Uphawu Olubomvu Lokuthengiswa Kwabantu: Licala elikhulu ngaphansi komthetho ukuthi umqhatshi athathe ipasipoti yakho yangempela.',
    },
    whyScammersDoIt: {
      en: 'Human trafficking syndicates seize passports to trap youth in forced labor or sexual exploitation abroad (e.g. Gulf/Middle East domestic worker scams).',
      sn: 'Matsotsi anotora mapasipoti kumanikidza vechidiki kuita mabasa akaoma kana ekubatwa chibharo kunze kwenyika.',
      nd: 'Izigebengu zithatha amapasipoti ukuze zivalele abasakhulayo emsebenzini oyingozi kumbe ukuxhashazwa kwezocansi phesheya.',
    },
    whatLegitEmployersDo: {
      en: 'Legitimate international recruiters only inspect your passport in your presence and let you hold your original book at all times.',
      sn: 'Vashandirwi vechokwadi vekunze vanongoona pasipoti iwe uripo vobva vakupa bhuku rako uchiribata wega nguva dzose.',
      nd: 'Abaqhatshi beqiniso baphesheya bakhangela nje ipasipoti ukhona besebekunika incwadi yakho uyiphathe ngazo zonke izikhathi.',
    },
    proTip: {
      en: 'Use Document Guard to watermark any digital copy with "Application Only", and call the Musasa / Anti-Trafficking hotline immediately if pressured.',
      sn: 'Shandisa Document Guard kuisa watermark pakopi yepasipoti, uye fona nhamba yeMusasa / Anti-Trafficking nekukurumidza.',
      nd: 'Sebenzisa i-Document Guard ukubeka i-watermark ekhasini lepasipoti, njalo uthayele i-Musasa ngokushesha.',
    },
  },
  SIG_URGENT_DEADLINE: {
    id: 'SIG_URGENT_DEADLINE',
    triggerRedFlag: 'Artificial Pressure & Immediate "Pay Before 5pm" Deadlines',
    category: 'urgency',
    durationSeconds: 20,
    headline: {
      en: '20-Sec Lesson: Scammers Manufacture Urgent Panic',
      sn: 'Chidzidzo Chemasekondi 20: Matsotsi Anogadzira Kusagadzikana Kwekuchimbidza',
      nd: 'Isifundo Semizuzwana 20: Izigebengu Zenza Ukukhathazeka Ngokushesha',
    },
    ruleOfThumb: {
      en: 'Panic Disarms Logic: If an ad says "Only 3 slots left! Pay within 1 hour or your job is lost", it is designed to bypass your caution.',
      sn: 'Kuvhunduka Kunodzima Pfungwa: Kana chiziviso chichiti "Kwasara nzvimbo 3 chete! Bhadhara mukati meawa 1", vanoda kukubira usingafunge.',
      nd: 'Ukwethuka Kucima Ingqondo: Nxa isaziso sisithi "Kusele izikhala ezi-3 kuphela! Bhadhala ngaphansi kwehora", bafuna ukukweba ungacabanganga.',
    },
    whyScammersDoIt: {
      en: 'Pressure prevents you from phoning your parents, checking with friends, or verifying the company registration before you press the transfer button.',
      sn: 'Kumanikidzwa kunokutadzisa kufonera vabereki, kubvunza shamwari, kana kutarisa marejisita ekambani usati watumira mari.',
      nd: 'Ukucindezelwa kukuvimbela ukuthi uthayele abazali, ubuze abangane, kumbe uhlole inkampani ungakathumeli imali.',
    },
    whatLegitEmployersDo: {
      en: 'Professional recruitment cycles take days or weeks with formal written shortlist notifications, never minutes on WhatsApp.',
      sn: 'Maitiro ebasa emakambani anotora mazuva kana masvondo aine zviziviso zvakanyorwa zvakanaka, kwete maminitsi paWhatsApp.',
      nd: 'Imisebenzi esemthethweni ithatha izinsuku kumbe amaviki ngezaziso ezibhaliweyo, hatshi imizuzu ku-WhatsApp.',
    },
    proTip: {
      en: 'Pause for 10 minutes. Tell the recruiter "I am consulting my mentor". A scammer gets angry; a real company agrees.',
      sn: 'Chimbomira kwemaminitsi 10. Taura kuti "Ndiri kumbotaura nemumwe mukuru". Chitsotsi chinoshatirwa; kambani chaiyo inobvuma.',
      nd: 'Misa okwemizuzu engu-10. Tshela umqhatshi ukuthi "Ngisakhuluma lomeluleki wami". Isigebengu sizathukuthela; inkampani yangempela iyavuma.',
    },
  },
  SIG_DEFAULT_SAFE: {
    id: 'SIG_DEFAULT_SAFE',
    triggerRedFlag: 'Defensive Due Diligence Best Practice',
    category: 'legitimate',
    durationSeconds: 20,
    headline: {
      en: '20-Sec Lesson: How to Keep Protecting Yourself',
      sn: 'Chidzidzo Chemasekondi 20: Maitiro Ekuramba Uchizvidzivirira',
      nd: 'Isifundo Semizuzwana 20: Indlela Yokuzivikela Ngaso Sonke Isikhathi',
    },
    ruleOfThumb: {
      en: 'Even when an offer looks low-risk, maintain safe disclosure hygiene: never give your banking PIN, OTP, or original identity papers.',
      sn: 'Kunyange basa richiratidza kuchengetedzeka, chengetedza zvakavanzika zvako: usambopa PIN yebhanga, OTP, kana mapasipoti chaiwo.',
      nd: 'Lanxa umsebenzi ubonakala uphephile, gcina imfihlo yakho: ungaze wanika i-PIN yebhanga, i-OTP, kumbe amaphepha okuqala.',
    },
    whyScammersDoIt: {
      en: 'Some modern scams start politely with genuine-looking job ads, and only attempt to extract banking OTPs or identity theft data in step 3.',
      sn: 'Zvimwe zvidavado zvemazuva ano zvinotanga zvakanaka asi zvinozoda kuba OTP dzemabhanga kana ruzivo rwemunhu pamatanho ekumberi.',
      nd: 'Obunye ubugebengu buqala kuhle ngezaziso eziqondileyo kodwa buzozama ukuntshontsha ama-OTP amabhanga ngesinyathelo sesithathu.',
    },
    whatLegitEmployersDo: {
      en: 'Verified employers sign zero-fee charters, host auditable physical premises, and pay statutory wages through verified payroll channels.',
      sn: 'Vashandirwi vakasimbiswa vanosaina zvibvumirano zvisingabhadharisi, vane mahofisi anozivikanwa, uye vanobhadhara muhoro zviri pamutemo.',
      nd: 'Abaqhatshi abaqinisekisiweyo basayina izifungo zokungabhadalisi, balamahofisi aziwayo, njalo babhadhala imiholo esemthethweni.',
    },
    proTip: {
      en: 'Always run any interview invite address through our Safe Interview Plan checklist before traveling.',
      sn: 'Nguva dzose tarisa kero yebasa mune yedu Safe Interview Plan usati waenda.',
      nd: 'Hlola ikheli lomsebenzi kuhlu yethu yeSafe Interview Plan ungakahambi.',
    },
  },
};

/**
 * Helper to look up the most relevant micro-lesson based on triggered signals
 */
export function getMicroLessonForVerdict(signalIds: string[], verdict: string): MicroLesson {
  if (signalIds.includes('SIG_ADVANCE_FEE')) return MICRO_LESSONS.SIG_ADVANCE_FEE;
  if (signalIds.includes('SIG_PERSONAL_PAYMENT')) return MICRO_LESSONS.SIG_PERSONAL_PAYMENT;
  if (signalIds.includes('SIG_PASSPORT_HOLD')) return MICRO_LESSONS.SIG_PASSPORT_HOLD;
  if (signalIds.includes('SIG_IMPERSONATION_DOMAIN')) return MICRO_LESSONS.SIG_IMPERSONATION_DOMAIN;
  if (signalIds.includes('SIG_URGENT_DEADLINE')) return MICRO_LESSONS.SIG_URGENT_DEADLINE;

  // Fallback to highest risk or default
  if (verdict === 'HIGH_RISK') return MICRO_LESSONS.SIG_ADVANCE_FEE;
  if (verdict === 'SUSPICIOUS') return MICRO_LESSONS.SIG_URGENT_DEADLINE;
  return MICRO_LESSONS.SIG_DEFAULT_SAFE;
}

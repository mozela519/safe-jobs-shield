/**
 * Safe Jobs Shield - Synthetic Demo Test Messages
 *
 * NOTE: DEFENSIVE AND DEMO USE ONLY.
 * All messages are purely synthetic test cases designed to test the rules engine.
 * No real entities or scam operations are depicted.
 */

import { SampleMessage } from '../types';

export const SAMPLE_MESSAGES: SampleMessage[] = [
  // 6 SCAMS OF DIFFERENT TYPES
  {
    id: 'scam-fee-ecocash',
    title: '1. Upfront Uniform & Medical Fee (EcoPay Scam)',
    category: 'scam',
    scamType: 'Upfront Registration / Uniform Fee',
    languageLabel: 'English / ChiShona mix',
    sender: '+263 77 912 3456 (Fake Agent)',
    expectedVerdict: 'HIGH_RISK',
    shortDescription: 'Claims retail logistics depot job but demands $25 uniform and processing fee via EcoPay before training.',
    text: `URGENT VACANCIES! Savanna Logistics & Wholesale Retail Depot Harare is hiring 40 General Workers & Packers immediately!
No experience needed. Starting salary $450 USD cash per month + food vouchers.
To secure your slot, you must pay $25 USD medical badge & uniform processing fee today via EcoPay to Agent Tendai on 0779123456.
Limited slots left! Pay today or your slot will be given to someone else. Send EcoPay reference on WhatsApp immediately.`,
  },
  {
    id: 'scam-trafficking-overseas',
    title: '2. Overseas Hospitality / Exploitation Red Flag (Trafficking Risk)',
    category: 'scam',
    scamType: 'Exploitation & Human Trafficking Indicator',
    languageLabel: 'English',
    sender: '+971 50 123 9876 (Unknown Gulf Recruiter)',
    expectedVerdict: 'HIGH_RISK',
    shortDescription: 'Requests full-body photos, vague Kuwait/Dubai hotel role, free flights arranged privately, secrecy warned.',
    text: `URGENT: Hostess and domestic assistants needed for VIP private estate in Dubai / Kuwait.
Salary $2,200 USD tax free + luxury accommodation and all meals provided.
Requirements: Ages 19-27 only. Send 3 full body photos, waist measurements, and your original passport scan directly to this private WhatsApp chat.
Do not tell other people or discuss at travel agencies, we handle all flight tickets directly. Immediate deployment next week.`,
  },
  {
    id: 'scam-phishing-lookalike',
    title: '3. Lookalike Telecom Phishing Link',
    category: 'scam',
    scamType: 'Phishing & Impersonation Link',
    languageLabel: 'English',
    sender: 'Apex-Telecom-Bot (+263 78 440 1928)',
    expectedVerdict: 'HIGH_RISK',
    shortDescription: 'Impersonates Apex Telecom using suspicious .xyz domain and free Gmail contact.',
    text: `Apex Telecom Zimbabwe Graduate Trainee Programme 2026 is officially open!
Apply now before midnight today at http://apextelecom-careers-portal.xyz/apply-now
Free training stipend of $800 USD. For queries contact humanresources.apextelecom.recruitment@gmail.com.
Act now! Only 15 places available for youth across Zimbabwe.`,
  },
  {
    id: 'scam-identity-theft-pin',
    title: '4. Identity & Bank PIN Extraction',
    category: 'scam',
    scamType: 'Identity Theft / Banking Credential Harvester',
    languageLabel: 'English',
    sender: '+263 71 882 0019',
    expectedVerdict: 'HIGH_RISK',
    shortDescription: 'Demands national ID, bank card photo, and OTP verification code prior to any interview.',
    text: `Congratulations! Your profile has been pre-selected for the UN Humanitarian Aid Logistics Clerk role in Mutare.
Before scheduled interview, our automated payroll system requires verification:
1. Scan of National ID front and back
2. Photo of your ZimSwitch/VISA bank card
3. You will receive an SMS OTP code on your phone shortly; forward it to this chat to confirm your direct deposit registration.`,
  },
  {
    id: 'scam-unrealistic-salary-farm',
    title: '5. Unrealistic Salary ($6,500/mo Canadian Farm Work)',
    category: 'scam',
    scamType: 'Unrealistic Salary & Visa Processing Scam',
    languageLabel: 'English',
    sender: '+1 437 889 2033 (Unverified Canada Number)',
    expectedVerdict: 'HIGH_RISK',
    shortDescription: 'Promises $6,500 USD per month for unskilled fruit picking, asks for $120 biometric fee.',
    text: `CANADA GOVERNMENT APPROVED AGRICULTURAL RECRUITMENT 2026.
Fruit Pickers, Packers and Farm Drivers needed. No IELTS required, no formal education needed.
Salary: $6,500 USD per month + free family housing.
Send passport copy and pay $120 USD international biometric processing fee to Western Union agent in Harare. Contact visa.canada.approved@yahoo.com now.`,
  },
  {
    id: 'scam-secret-whatsapp-fees',
    title: '6. Secret WhatsApp Council Interview Slot',
    category: 'scam',
    scamType: 'Bribery / Secret Slot Advance Fee',
    languageLabel: 'English / ChiShona mix',
    sender: '+263 77 301 9922',
    expectedVerdict: 'HIGH_RISK',
    shortDescription: 'Claims inside connection at City Council, insists on secrecy and mobile money facilitation fee.',
    text: `Mupfanha, pane vacancy yeClerk paCity of Harare Town House. Pane shamwari yangu irimo mukati.
Keep this strictly between us, musaudza vamwe vanhu. Hakuna interview yakaoma.
Just send $40 yekubatsira maHR officers vanyore zita rako pamberi.
DM me on this private WhatsApp line only. Don't call office. Offer expires pa 5pm nhasi.`,
  },

  // 4 LEGITIMATE EMPLOYER OFFERS
  {
    id: 'legit-zambezi-digital',
    title: '7. Zambezi Digital Solutions (Verified Local Tech Firm)',
    category: 'legitimate',
    languageLabel: 'English',
    sender: 'careers@zambezidigital.co.zw',
    expectedVerdict: 'LOW_RISK',
    shortDescription: 'Official .co.zw domain, registered CBD office, transparent multi-stage technical interview, zero fees.',
    text: `Zambezi Digital Solutions is recruiting a Junior Frontend Developer (Intern / Entry Level).
Location: 8 Samora Machel Avenue, Harare CBD.
We require basic React & TypeScript skills. Selection involves a practical take-home coding test followed by an in-person panel interview at our Harare office.
Notice: Zambezi Digital Solutions NEVER requests any fee, payment, or banking PINs at any stage of our recruitment process.
Apply through our official company portal: https://zambezidigital.co.zw/careers or email hr@zambezidigital.co.zw. Tel: +263 242 884501.`,
  },
  {
    id: 'legit-batanai-health-ngo',
    title: '8. Batanai Community Health Trust (Verified NGO)',
    category: 'legitimate',
    languageLabel: 'English',
    sender: 'recruitment@batanaihealth.org.zw',
    expectedVerdict: 'LOW_RISK',
    shortDescription: 'Verified .org.zw NGO domain, physical Fife Avenue address, explicit zero fee policy, structured interview.',
    text: `Vacancy Notice: Community Health Field Officer (Contract: 12 Months).
Organization: Batanai Community Health Trust, 15 Fife Avenue, Avenues, Harare.
Key Responsibilities: Supporting youth health education and data recording in community clinics.
Requirements: Degree or Diploma in Social Sciences, Public Health or Nursing.
Application Procedure: Submit CV and Cover Letter to recruitment@batanaihealth.org.zw. Shortlisted candidates will attend an in-person panel interview.
EQUAL OPPORTUNITY EMPLOYER. Batanai Community Health Trust DOES NOT charge any application, processing, or training fees. We adhere to child safeguarding and zero-exploitation principles.`,
  },
  {
    id: 'legit-zimfresh-farms',
    title: '9. ZimFresh Agribusiness Ltd (Verified Agricultural Producer)',
    category: 'legitimate',
    languageLabel: 'English',
    sender: 'hr@zimfresh-farms.co.zw',
    expectedVerdict: 'LOW_RISK',
    shortDescription: 'Verified agribusiness with physical Mazowe farm, official landline, accredited internship program.',
    text: `ZimFresh Agribusiness Ltd invites applications for our 2026 Horticulture Graduate Apprenticeship.
Location: Plot 14 Mazowe Valley Way, Mashonaland Central.
Remuneration: Statutory NEC Agricultural wages with covered transport allowance.
Interviews will be conducted physically at the Mazowe Packhouse facility.
Official Enquiries: Telephone +263 242 789100 or visit our official website at https://zimfresh-farms.co.zw.
Strict Policy: We do not accept mobile money or personal cash for recruitment. All correspondence is through official company channels.`,
  },
  {
    id: 'legit-matabeleland-solar',
    title: '10. Matabeleland Solar Tech (Bulawayo Apprentice Program)',
    category: 'legitimate',
    languageLabel: 'English / isiNdebele reference',
    sender: 'info@matabeleland-solar.co.zw',
    expectedVerdict: 'LOW_RISK',
    shortDescription: 'Accredited technical apprenticeship in Bulawayo, formal trade union rates, registered physical address.',
    text: `Matabeleland Solar Tech is hiring 6 Solar Installation Apprentices for our Bulawayo Operations.
Office: 105 Robert Mugabe Way, Bulawayo. Tel: +263 292 245100.
We offer hands-on renewable energy training, safety gear provided free of charge, and NEC engineering union allowances.
Candidates will be invited for an aptitude test and physical workshop orientation.
No agency fees. Apply online at https://matabeleland-solar.co.zw or drop your CV at our Bulawayo reception desk during working hours.`,
  },

  // 2 AMBIGUOUS OFFERS
  {
    id: 'ambiguous-hardware-shop',
    title: '11. Informal Shop Assistant Flyer (Inconclusive / Ask Details)',
    category: 'ambiguous',
    languageLabel: 'English',
    sender: '+263 77 399 1200 (Informal Mobile)',
    expectedVerdict: 'NOT_ENOUGH_INFO',
    shortDescription: 'Local shop assistant needed. No fee asked, but lacks company name, registered address, or structured role.',
    text: `Looking for shop assistant at hardware store in Chitungwiza. Hardworking youth wanted. Drop CV on WhatsApp 0773991200.`,
  },
  {
    id: 'ambiguous-cv-forwarding',
    title: '12. Brief Warehouse SMS (Too Brief for Confidence)',
    category: 'ambiguous',
    languageLabel: 'English',
    sender: '+263 71 500 2341',
    expectedVerdict: 'NOT_ENOUGH_INFO',
    shortDescription: 'Short text requesting CV for packing shift. Insufficient data to determine fraud or legitimacy.',
    text: `Send your CV to warehousejobs2026@gmail.com for sorting shift. Starting Monday.`,
  },
];

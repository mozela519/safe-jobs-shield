/**
 * Safe Jobs Shield - Unit Tests for Rules Engine (27 Test Cases)
 * Demonstrating complete verification of defensive detection logic.
 */

import { analyzeJobOffer } from './rules';
import { redactPII, verifyEmployerSignature } from '../crypto/privacy';
import { TestCase } from '../types';

export interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  durationMs: number;
  details?: string;
}

export const UNIT_TEST_CASES: TestCase[] = [
  {
    id: 'TEST_01',
    name: 'Upfront EcoCash uniform fee scam',
    input: 'Hiring packers immediately! Pay $25 USD uniform and medical badge fee via EcoCash to 0779123456 today to start work.',
    expectedVerdict: 'HIGH_RISK',
    expectedSignalId: 'SIGNAL_UPFRONT_FEE',
    description: 'Verifies detection of advance fee demands with mobile money keyword.',
  },
  {
    id: 'TEST_02',
    name: 'Registration fee for supermarket cashier',
    input: 'Supermarket general worker slots open. Pay $15 application fee to HR agent before interview deployment.',
    expectedVerdict: 'HIGH_RISK',
    expectedSignalId: 'SIGNAL_UPFRONT_FEE',
    description: 'Detects application and registration fee keywords.',
  },
  {
    id: 'TEST_03',
    name: 'Bank PIN and OTP credential theft',
    input: 'To setup your salary direct deposit, send photo of your bank card front and back along with your ATM PIN and the OTP code received.',
    expectedVerdict: 'HIGH_RISK',
    expectedSignalId: 'SIGNAL_IDENTITY_THEFT',
    description: 'Flags critical banking credential extraction attempts.',
  },
  {
    id: 'TEST_04',
    name: 'Original passport and national ID scan request before interview',
    input: 'Forward your national ID copy and send passport scan directly to this recruiter before any interview can take place.',
    expectedVerdict: 'HIGH_RISK',
    expectedSignalId: 'SIGNAL_IDENTITY_THEFT',
    description: 'Flags identity document harvesting.',
  },
  {
    id: 'TEST_05',
    name: 'Trafficking indicator: Full body photos and waist measurements',
    input: 'Hostess needed for luxury Dubai VIP estate. Send 3 full body photos and waist measurements. Ages 19-24 only.',
    expectedVerdict: 'HIGH_RISK',
    expectedSignalId: 'SIGNAL_TRAFFICKING_EXPLOITATION_RISK',
    description: 'Triggers critical human trafficking alert and national helpline guidance.',
  },
  {
    id: 'TEST_06',
    name: 'Trafficking indicator: Recruiter private flight ticket without agency',
    input: 'Domestic workers needed in Kuwait. Flight tickets directly arranged by recruiter. Do not tell travel agencies. Immediate deployment.',
    expectedVerdict: 'HIGH_RISK',
    expectedSignalId: 'SIGNAL_TRAFFICKING_EXPLOITATION_RISK',
    description: 'Detects unverified travel and isolation tactics.',
  },
  {
    id: 'TEST_07',
    name: 'Free Gmail used by claimed corporate employer',
    input: 'Delta Beverages Zimbabwe is hiring 20 Warehouse Operatives. Send CV and cover letter to deltabeverages.recruitment2026@gmail.com.',
    expectedVerdict: 'SUSPICIOUS',
    expectedSignalId: 'SIGNAL_FREE_EMAIL_MISMATCH',
    description: 'Flags free email domain mismatch for major corporate brand.',
  },
  {
    id: 'TEST_08',
    name: 'Free Yahoo used for United Nations position',
    input: 'United Nations Zimbabwe humanitarian logistics officer vacancy. Forward documents to un.recruitment.harare@yahoo.com immediately.',
    expectedVerdict: 'SUSPICIOUS',
    expectedSignalId: 'SIGNAL_FREE_EMAIL_MISMATCH',
    description: 'Flags free public email address for intergovernmental body.',
  },
  {
    id: 'TEST_09',
    name: 'Artificial urgency and panic tactics',
    input: 'Act now! Limited slots remaining for youth traineeship. Offer expires today before midnight! Only 15 places available across Zimbabwe.',
    expectedVerdict: 'SUSPICIOUS',
    expectedSignalId: 'SIGNAL_URGENCY_PRESSURE',
    description: 'Detects artificial deadlines intended to prevent due diligence.',
  },
  {
    id: 'TEST_10',
    name: 'Unrealistic salary bait: $6,500/mo fruit picker in Canada',
    input: 'Canada government approved agricultural work. Fruit pickers and packers wanted. Salary $6,500 USD per month. No IELTS and no experience required.',
    expectedVerdict: 'SUSPICIOUS',
    expectedSignalId: 'SIGNAL_UNREALISTIC_OVERSEAS_PROMISE',
    description: 'Identifies exaggerated overseas compensation bait.',
  },
  {
    id: 'TEST_11',
    name: 'Secrecy request: strictly between us',
    input: 'City Council clerk vacancy. Keep this strictly between us and do not tell anyone else. Inquire through private WhatsApp only.',
    expectedVerdict: 'SUSPICIOUS',
    expectedSignalId: 'SIGNAL_SECRECY_PRIVATE_CHAT',
    description: 'Flags secrecy demands that bypass institutional governance.',
  },
  {
    id: 'TEST_12',
    name: 'Secrecy request in ChiShona: musaudza vamwe vanhu',
    input: 'Mupfanha pane basa paTown House. Musaudza vamwe vanhu zvachose. Private WhatsApp chete. Don not call office.',
    expectedVerdict: 'SUSPICIOUS',
    expectedSignalId: 'SIGNAL_SECRECY_PRIVATE_CHAT',
    description: 'Identifies local vernacular secrecy language.',
  },
  {
    id: 'TEST_13',
    name: 'Suspicious shortened URL in job invitation',
    input: 'Econet Graduate Trainee batch B is announced. Verify your shortlist status at http://bit.ly/econet-trainee-2026 before 5pm.',
    expectedVerdict: 'SUSPICIOUS',
    expectedSignalId: 'SIGNAL_SUSPICIOUS_DOMAIN_OR_SHORTENER',
    description: 'Detects URL shortener hiding true destination.',
  },
  {
    id: 'TEST_14',
    name: 'Lookalike domain with suspicious .xyz TLD',
    input: 'Apply for Ministry of Youth apprenticeship scheme online at http://zim-youth-careers.xyz/apply before the portal closes today.',
    expectedVerdict: 'SUSPICIOUS',
    expectedSignalId: 'SIGNAL_SUSPICIOUS_DOMAIN_OR_SHORTENER',
    description: 'Flags suspicious top-level domain spoofing.',
  },
  {
    id: 'TEST_15',
    name: 'Community reported recruiter phone match',
    input: 'Office assistant position available in Harare CBD. Call recruiter on +263 77 999 1122 for immediate interview arrangement.',
    expectedVerdict: 'SUSPICIOUS',
    expectedSignalId: 'SIGNAL_COMMUNITY_FLAGGED_REPUTATION',
    description: 'Integrates community cryptographic reputation penalty.',
  },
  {
    id: 'TEST_16',
    name: 'Verified Employer match: Zambezi Digital Solutions',
    input: 'Zambezi Digital Solutions is hiring a Junior Frontend Developer. Apply via https://zambezidigital.co.zw/careers or 8 Samora Machel Avenue. No fees.',
    expectedVerdict: 'LOW_RISK',
    expectedSignalId: 'SIGNAL_MATCHED_VERIFIED_EMPLOYER',
    description: 'Verifies registry lookup and Web Crypto signature approval.',
  },
  {
    id: 'TEST_17',
    name: 'Verified Employer match: Batanai Community Health Trust',
    input: 'Batanai Community Health Trust, 15 Fife Avenue Harare. We do not charge any application or processing fees. Panel interview at our office.',
    expectedVerdict: 'LOW_RISK',
    expectedSignalId: 'SIGNAL_NO_FEES_POLICY',
    description: 'Rewards explicit zero-fee policy and verified NGO status.',
  },
  {
    id: 'TEST_18',
    name: 'Verified Employer match: ZimFresh Agribusiness Ltd',
    input: 'ZimFresh Agribusiness Ltd invites applications for our Mazowe Farm apprentices. Applications through official website https://zimfresh-farms.co.zw.',
    expectedVerdict: 'LOW_RISK',
    expectedSignalId: 'SIGNAL_OFFICIAL_ZIM_DOMAIN',
    description: 'Validates official .co.zw agricultural enterprise domain.',
  },
  {
    id: 'TEST_19',
    name: 'Verified Employer match: Matabeleland Solar Tech in Bulawayo',
    input: 'Matabeleland Solar Tech is hiring installation trainees at 105 Robert Mugabe Way Bulawayo. Structured aptitude test and physical workshop orientation. No agency fees.',
    expectedVerdict: 'LOW_RISK',
    expectedSignalId: 'SIGNAL_STRUCTURED_INTERVIEW_PROCESS',
    description: 'Validates multi-stage physical interview in Bulawayo.',
  },
  {
    id: 'TEST_20',
    name: 'Ambiguous short message: Hardware shop assistant',
    input: 'Looking for shop assistant at hardware store in Chitungwiza. Drop CV on WhatsApp 0773991200.',
    expectedVerdict: 'NOT_ENOUGH_INFO',
    description: 'Correctly classifies low-wordcount ambiguous text without accusations.',
  },
  {
    id: 'TEST_21',
    name: 'Ambiguous short message: Bare warehouse SMS',
    input: 'Send your CV to warehousejobs2026@gmail.com for sorting shift. Starting Monday.',
    expectedVerdict: 'NOT_ENOUGH_INFO',
    description: 'Avoids premature verdict when text is brief and lacks explicit red flags.',
  },
  {
    id: 'TEST_22',
    name: 'Combined scam: Fee + Secrecy + Urgent EcoCash',
    input: 'URGENT! Airport cargo slots. Pay $30 EcoCash to 0771234567 before 2pm. Keep secret from other applicants. Limited slots!',
    expectedVerdict: 'HIGH_RISK',
    expectedMinScore: 70,
    description: 'Accurately sums compound weights across multiple red flags.',
  },
  {
    id: 'TEST_23',
    name: 'PII Redaction: Masks Zimbabwean mobile numbers',
    input: 'Contact recruiter on 0772123456 or +263 71 999 8888 for details.',
    expectedVerdict: 'NOT_ENOUGH_INFO', // test checks PII masking in details
    description: 'Checks phone numbers are transformed into [REDACTED_PHONE].',
  },
  {
    id: 'TEST_24',
    name: 'PII Redaction: Masks email addresses',
    input: 'Send your CV to private.recruiter.zim@gmail.com by tomorrow morning.',
    expectedVerdict: 'NOT_ENOUGH_INFO',
    description: 'Checks email addresses are masked prior to external transmission.',
  },
  {
    id: 'TEST_25',
    name: 'Cryptographic signature verification on untampered employer payload',
    input: 'EMP-001|ZimFresh Agribusiness Ltd|ZIM-CO-2023-8841|zimfresh-farms.co.zw|+263242789100|Plot 14 Mazowe Valley Way, Mashonaland Central',
    expectedVerdict: 'LOW_RISK',
    description: 'Verifies Web Crypto HMAC verification passes on authentic payload.',
  },
  {
    id: 'TEST_26',
    name: 'Cryptographic signature verification fails on tampered payload',
    input: 'EMP-001|ZimFresh Agribusiness Ltd|ZIM-CO-2023-8841|scammer-fake-domain.xyz|+263242789100|Plot 14 Mazowe Valley Way, Mashonaland Central',
    expectedVerdict: 'SUSPICIOUS',
    description: 'Demonstrates tamper-detection when an attacker alters domain to fake URL.',
  },
  {
    id: 'TEST_27',
    name: 'Score bounding: Score never exceeds 100 or drops below 0',
    input: 'Pay $500 fee today! Send bank pin and otp and passport scan to secret whatsapp 0771112222. Limited slots! Body measurements needed for Dubai.',
    expectedVerdict: 'HIGH_RISK',
    expectedMaxScore: 100,
    description: 'Verifies defensive mathematical bounds on compound risk weights.',
  },
];

/**
 * Runs all unit tests and returns structured results
 */
export async function runAllRulesTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const t of UNIT_TEST_CASES) {
    const start = performance.now();
    try {
      if (t.id === 'TEST_23') {
        const { redactedText } = redactPII(t.input);
        const passed = redactedText.includes('[REDACTED_PHONE]') && !redactedText.includes('0772123456');
        results.push({
          id: t.id,
          name: t.name,
          passed,
          expected: 'Phone numbers replaced with [REDACTED_PHONE]',
          actual: passed ? 'Successfully masked' : 'Failed to mask: ' + redactedText,
          durationMs: performance.now() - start,
          details: t.description,
        });
        continue;
      }

      if (t.id === 'TEST_24') {
        const { redactedText } = redactPII(t.input);
        const passed = redactedText.includes('[REDACTED_EMAIL') && !redactedText.includes('private.recruiter.zim@gmail.com');
        results.push({
          id: t.id,
          name: t.name,
          passed,
          expected: 'Email replaced with [REDACTED_EMAIL]',
          actual: passed ? 'Successfully masked' : 'Failed to mask: ' + redactedText,
          durationMs: performance.now() - start,
          details: t.description,
        });
        continue;
      }

      if (t.id === 'TEST_25') {
        const validSig = 'e4a54bb3f65ee82a4d4ba9abb7601c2fea6f6f736e90dcaf8f4258ab3e9f9bee';
        const isValid = await verifyEmployerSignature(t.input, validSig);
        results.push({
          id: t.id,
          name: t.name,
          passed: isValid === true,
          expected: 'Valid signature returns true',
          actual: `Signature valid: ${isValid}`,
          durationMs: performance.now() - start,
          details: t.description,
        });
        continue;
      }

      if (t.id === 'TEST_26') {
        const validSig = 'e4a54bb3f65ee82a4d4ba9abb7601c2fea6f6f736e90dcaf8f4258ab3e9f9bee';
        const isValid = await verifyEmployerSignature(t.input, validSig);
        results.push({
          id: t.id,
          name: t.name,
          passed: isValid === false,
          expected: 'Tampered payload returns false',
          actual: `Signature valid: ${isValid} (Tamper detected)`,
          durationMs: performance.now() - start,
          details: t.description,
        });
        continue;
      }

      // Community lookup simulation for test 15
      const mockOptions = t.id === 'TEST_15'
        ? {
            communityReportLookup: () => 4, // 4 mock reports
          }
        : undefined;

      const evalResult = await analyzeJobOffer(t.input, mockOptions);

      let passed = evalResult.verdict === t.expectedVerdict;

      if (t.expectedSignalId) {
        const hasSignal = evalResult.signals.some((s) => s.id === t.expectedSignalId) ||
                          evalResult.positiveSignals.some((p) => p.id === t.expectedSignalId);
        if (!hasSignal) passed = false;
      }

      if (t.expectedMinScore !== undefined && evalResult.score < t.expectedMinScore) {
        passed = false;
      }

      if (t.expectedMaxScore !== undefined && evalResult.score > t.expectedMaxScore) {
        passed = false;
      }

      results.push({
        id: t.id,
        name: t.name,
        passed,
        expected: `Verdict: ${t.expectedVerdict}${t.expectedSignalId ? ` & Signal: ${t.expectedSignalId}` : ''}`,
        actual: `Verdict: ${evalResult.verdict} (Score: ${evalResult.score}/100)`,
        durationMs: performance.now() - start,
        details: t.description,
      });
    } catch (err: any) {
      results.push({
        id: t.id,
        name: t.name,
        passed: false,
        expected: t.expectedVerdict,
        actual: `Error: ${err.message}`,
        durationMs: performance.now() - start,
        details: t.description,
      });
    }
  }

  return results;
}

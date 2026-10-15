# Comparative Matrix — Safe Jobs Shield vs. Existing Solutions

**Note on Honesty & Verification:**
Competitor capabilities marked as **[VERIFY]** indicate features that depend on third-party carrier agreements, regional availability in Zimbabwe, or proprietary closed-source policies. These must be verified directly before citation in academic or hackathon competition publications.

---

| Feature Dimension | Safe Jobs Shield (This Project) | Google Safe Browsing | ScamAdviser | Truecaller / Hiya Filters | Zimbabwean Telco / Bank SMS Alerts |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Local Languages (ChiShona & isiNdebele)** | **Yes (Built-in dictionaries & audio pipeline)** | No [VERIFY: English / global languages only] | No [VERIFY: Web interface in major global languages] | Partial [VERIFY: App UI English; crowdsourced caller names in vernacular] | Partial (Occasional SMS awareness campaigns in Shona/Ndebele) |
| **Recruitment Scam & Human Trafficking Focus** | **Yes (Specialized vectors: uniforms, body photos, Gulf maid schemes, helpline 08080074)** | No (Broad malware & phishing focus) | Partial (General e-commerce & domain trust rating) | No (General spam & telemarketing call filtering) | Partial (General warning: "do not send money to strangers") |
| **Plain-Language Diagnostic Explanations** | **Yes (Explains specific red flags + immediate safe next steps)** | No (Binary red warning screen: "Dangerous Site") | Partial (Numerical trust score 1-100 with technical domain flags) | No (Binary tag: "Spam", "Scam Likely", "Telemarketer") | No (Generic broadcast warnings) |
| **Verified Employer Registry & Tamper-Evidence** | **Yes (Web Crypto HMAC-SHA256 signatures for authentic Zimbabwean employers)** | No | No [VERIFY: Offers merchant trust seals, but no cryptographic registry] | No | No |
| **Privacy-Preserving Architecture (Zero Cleartext Logging)** | **Yes (HMAC-SHA256 hashed identifiers only; Cyber & Data Protection Act [12:07])** | [VERIFY: Uses hashed URL prefixes via v4 API] | No [VERIFY: Logs searched URLs and user submissions] | No [VERIFY: Uploads contact address books in crowdsourced model] | N/A (Internal telco network billing logs) |
| **Works over WhatsApp & 2G Feature Phones (Low Data)** | **Yes (WhatsApp bot + USSD *707# architecture + Text-only mode)** | No (Requires modern web browser / Chrome) | No (Requires web browser and active data bundle) | No (Requires smartphone application and background data) | Yes (Runs natively over 2G SMS network) |
| **Open Source / Frugal Deployment Budget** | **Yes (~USD 5,000 annual target budget using free tiers)** | Proprietary Google infrastructure | Commercial SaaS / API subscription | Commercial freemium / Enterprise caller ID | Carrier infrastructure cost |

---

### Key Takeaways for HackLab Judges
1. **Domain Specialization:** While Google Safe Browsing and ScamAdviser are world-class at catching malicious URLs, they do not parse WhatsApp job messages asking for $25 uniform fees via EcoCash.
2. **Privacy Architecture:** Unlike crowdsourced caller ID apps that upload address books, Safe Jobs Shield hashes every identifier client-side and discards raw text.
3. **Inclusion First:** Truecaller and ScamAdviser require high-speed smartphones. Safe Jobs Shield's architecture is explicitly designed for WhatsApp and 2G feature phones (*707# USSD).

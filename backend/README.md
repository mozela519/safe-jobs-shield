# Safe Jobs Shield — Backend API & Evaluation Suite
**Zimbabwe Youth Innovation HackLab 2026 (Category 2: Youth Economic Empowerment)**  
*Multilingual, Privacy-First Job-Offer Verification Service for Young Job Seekers in Zimbabwe*

---

## 1. Quick Start with Docker

### Prerequisites
- Docker & Docker Compose installed.

### Run Locally in 1 Command
```bash
# From the backend directory
docker compose up --build
```
The FastAPI service will start at `http://localhost:8000`.

- **Swagger Documentation:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/health`

---

## 2. Local Setup without Docker (Python 3.10+)

```bash
# 1. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Generate synthetic training data & baseline model
python data/generate_dataset.py

# 4. Start the FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 3. Environment Variables Configuration

Create a `.env` file in the `backend/` directory:

```env
# Cryptographic secret pepper for HMAC-SHA256 privacy hashing
# Compliant with Zimbabwe Cyber and Data Protection Act [Chapter 12:07]
SJS_PEPPER="ZIM_SJS_PRODUCTION_PEPPER_CHANGE_ME_IN_ENV"

# Meta WhatsApp Cloud API credentials (Optional in local demo)
WHATSAPP_VERIFY_TOKEN="sjs_secret_verify_token_2026"
WHATSAPP_API_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""

# Optional Threat Intelligence API keys (Fallbacks gracefully if empty)
GOOGLE_SAFE_BROWSING_API_KEY=""
VIRUSTOTAL_API_KEY=""

# Optional Gemini API key for natural language explanation
GEMINI_API_KEY=""
```

---

## 4. API Endpoints Reference

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service status & regulatory compliance metadata |
| `POST` | `/check` | Evaluates job offer text, phone, or link against rules & ML |
| `POST` | `/report` | Submits hashed recruiter contact to community reputation pool |
| `GET` | `/employers` | Returns certified Zimbabwean employers with cryptographic signatures |
| `GET` | `/webhook` | Meta WhatsApp Cloud API verification handshake |
| `POST` | `/webhook` | Ingress webhook for incoming WhatsApp messages |

---

## 5. How to Reproduce the Evaluation Benchmarks

Run the evaluation script comparing **Rules-Only**, **TF-IDF + Logistic Regression**, and **Hybrid Ensemble**:

```bash
python eval/evaluate.py
```

This outputs:
1. Stratified train/test performance metrics (Precision, Recall, F1, False Positive Rate on Legitimate Offers).
2. Adversarial robustness stress test against keyword obfuscation (`E c o C a s h`, `f33`, `d e p o s i t`).
3. Cohen's kappa (κ) inter-rater reliability on double-labelled local vernacular samples.
4. Generates `eval/EVALUATION_REPORT.md`.

---

## 6. How to Run the Pytest Test Suite

```bash
pytest -v tests/
```
Verifies rules logic, PII sanitization regexes, HMAC consistency, and API rate limiting.

---

## 7. AI Honesty & Implementation Status

- **Implemented:**
  - Full deterministic rules engine (ported from TypeScript).
  - PII redaction pipeline (phones, emails, national IDs masked before processing).
  - Irreversible HMAC-SHA256 privacy hashing with time-decay reputation counter.
  - TF-IDF + Logistic Regression baseline classifier with clean transformer interface.
  - Comprehensive adversarial evaluation script.
- **Simulated:**
  - Synthetic training dataset (`synthetic_job_offers.csv`).
  - Simulated WHOIS domain age.
  - In-memory reputation state.
- **Requires Real Approval:**
  - Meta WhatsApp Business verification & Cloud API phone number.
  - POTRAZ USSD *707# shortcode allocation.
  - Native speaker sign-off on ChiShona and isiNdebele dictionaries.

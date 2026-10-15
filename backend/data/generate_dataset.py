"""
Synthetic Dataset Generator for Safe Jobs Shield.
NOTE: DEFENSIVE BENCHMARKING ONLY.
All samples generated here are purely synthetic test cases.
Never depicts real people or active criminal campaigns.
"""

import os
import csv
import random
import pickle
from typing import List, Dict, Any

# Synthetic scam archetypes
SCAM_TEMPLATES = [
    # 1. Advance Fee Scams
    "URGENT: Hiring {count} general warehouse workers and packers for OK Zimbabwe distribution. Starting pay ${salary} USD. Send ${fee} uniform badge fee via EcoCash to agent {name} on {phone} today. Slots limited!",
    "TM Pick n Pay supermarket cashier intake. Earn ${salary} USD monthly. Pay ${fee} medical certificate and registration fee today to confirm your slot. Contact {phone} on WhatsApp.",
    "Grain Marketing Board seasonal depot clerks wanted. High salary ${salary} USD. Applicants must send ${fee} processing fee via Mukuru or EcoCash to secure employment badge.",
    "Harare Airport cargo luggage handlers needed immediately. No experience required. Pay ${fee} safety gear clearance deposit to agent on WhatsApp {phone}. Pay before 5pm.",

    # 2. Trafficking / Exploitation Red Flags
    "Hostess and domestic helpers needed for VIP family in {location}. Free luxury apartment, salary ${salary} USD tax-free. Females ages 19-25 only. Send 3 full body photos, waist size, and original passport scan to private WhatsApp {phone}. Flight tickets handled directly, do not discuss at agencies.",
    "URGENT: Kuwait & Dubai hotel assistants needed immediately. Free visa and ticket provided directly by recruiter. Send passport and full length body photos to {phone}. Do not tell other people. Immediate deployment next week.",

    # 3. Phishing & Lookalike Links
    "Econet Wireless Zimbabwe 2026 Graduate Trainee intake open! Monthly stipend ${salary} USD. Register your details before midnight at http://econet-careers-portal{tld}/apply-now. Free laptops provided.",
    "Delta Beverages recruitment portal 2026 is live. Apply online at http://delta-jobs-zim{tld}/vacancies before spaces run out. Send queries to deltabeverages.hr@gmail.com.",

    # 4. Identity & Banking Credential Theft
    "UN Humanitarian Food Relief Agency is hiring Field Logistics Clerks in Mutare. Salary ${salary} USD. To verify direct deposit payroll, send photo of bank card front and back and your ATM PIN to recruiter.",
    "World Vision Zimbabwe entry clerk selection. Congratulations you have been pre-approved! Forward your national ID copy and the 6-digit SMS OTP code sent to your phone to finalize appointment.",

    # 5. Unrealistic Salary Overseas Bait
    "Canada Agriculture Scheme 2026! Fruit pickers, farm packers and drivers. Earn ${salary} USD per month. No education, no IELTS needed. Pay $150 biometric visa fee via Western Union to Harare agent.",
    "UK Farm Workers Needed! Pick apples in England, earn ${salary} USD per month with free accommodation. Fast visa processing. Contact visa.uk.jobs@yahoo.com now.",

    # 6. Secret Bribe / Connection
    "Mupfanha, pane vacancy yeClerk paCity of Harare Town House. Pane shamwari yangu irimo mukati. Keep this strictly secret between us. Send ${fee} yekubatsira maHR officers vanyore zita rako pamberi. Private WhatsApp only.",
]

LEGIT_TEMPLATES = [
    # 1. Corporate / Tech Verified
    "Zambezi Digital Solutions is hiring an Entry-Level Junior Frontend Developer in Harare CBD. We require basic React and TypeScript knowledge. Selection involves a coding test and physical panel interview at our office: 8 Samora Machel Avenue. Zambezi Digital Solutions NEVER charges application fees. Apply via https://zambezidigital.co.zw/careers.",
    "Econet Wireless Zimbabwe is accepting applications for the 2026 Graduate Trainee Programme. Minimum requirement: Upper Second degree in Engineering or Computer Science. Apply through official portal https://econet.co.zw/careers. Notice: Econet DOES NOT charge any fees for recruitment.",

    # 2. Verified NGO / Public Health
    "Batanai Community Health Trust invites applications for Community Health Field Officers (12 Month Contract) based in Harare. Requirements: Diploma or Degree in Nursing or Social Sciences. Send CV and cover letter to recruitment@batanaihealth.org.zw. Equal Opportunity Employer: We strictly do not charge any recruitment or processing fees.",
    "Higherlife Foundation is offering mentorship scholarships and youth internships. Applications open online at https://higherlifefoundation.org/careers. We adhere to child safeguarding principles. Zero agency fees.",

    # 3. Agribusiness / Manufacturing
    "ZimFresh Agribusiness Ltd invites applications for our Mazowe Farm Horticulture Apprenticeship. Statutory NEC agricultural wages and covered transport allowance. Physical interviews at our Mazowe Packhouse facility. Enquiries: +263 242 789100 or visit https://zimfresh-farms.co.zw. No mobile money accepted.",
    "Harare Logistics Cooperative is hiring 4 Warehouse Inventory Clerks at our Workington Industrial Depot. Formal panel interviews conducted on-site. Trade union regulated remuneration. Contact hr@hararelogistics.co.zw.",

    # 4. Renewable Energy / Trade
    "Matabeleland Solar Tech is recruiting 6 Solar Installation Apprentices for our Bulawayo workshop. Location: 105 Robert Mugabe Way, Bulawayo. Tel: +263 292 245100. Trade union accredited training with safety gear provided free of charge. Drop CV at Bulawayo office or apply at https://matabeleland-solar.co.zw.",
    "Great Zimbabwe Artisans Guild is accepting apprentice stone carvers and craft exports coordinators in Masvingo. Formal apprenticeship contract with monthly stipend. Apply via official guild registry: https://greatzimartisans.co.zw.",
]


def generate_synthetic_corpus(n_scam: int = 150, n_legit: int = 150) -> List[Dict[str, Any]]:
    """Generates synthetic dataset of labelled recruitment messages."""
    random.seed(42)
    corpus = []

    names = ["Tendai", "Farai", "Chipo", "Tinashe", "Kudakwashe", "Blessing", "Simbarashe", "Nomalanga", "Sipho"]
    phones = ["0771234567", "0779912345", "0718820019", "0784401928", "0732119944", "+263 77 301 9922"]
    locations = ["Dubai", "Kuwait", "Qatar", "Saudi Arabia", "Oman"]
    tlds = [".xyz", ".top", ".buzz", ".click", ".work"]

    # Generate Scams (label = 1)
    for i in range(n_scam):
        tmpl = random.choice(SCAM_TEMPLATES)
        text = tmpl.format(
            count=random.randint(15, 60),
            salary=random.choice([450, 650, 800, 2200, 5500, 6500]),
            fee=random.choice([15, 20, 25, 30, 45, 60]),
            name=random.choice(names),
            phone=random.choice(phones),
            location=random.choice(locations),
            tld=random.choice(tlds)
        )
        scam_type = "advance_fee" if "fee" in text.lower() or "deposit" in text.lower() else \
                    "trafficking_red_flag" if "photos" in text.lower() or "waist" in text.lower() else \
                    "phishing_link" if "http" in text.lower() else \
                    "identity_theft" if "card" in text.lower() or "pin" in text.lower() else "unrealistic_salary"

        corpus.append({
            "text": text,
            "language": "en",
            "label": 1,
            "scam_type": scam_type,
            "source": "synthetic_generator_v1"
        })

    # Generate Legitimate (label = 0)
    for i in range(n_legit):
        tmpl = random.choice(LEGIT_TEMPLATES)
        corpus.append({
            "text": tmpl,
            "language": "en",
            "label": 0,
            "scam_type": "none_legitimate",
            "source": "synthetic_generator_v1"
        })

    random.shuffle(corpus)
    return corpus


def main():
    data_dir = os.path.dirname(__file__)
    os.makedirs(data_dir, exist_ok=True)
    csv_path = os.path.join(data_dir, "synthetic_job_offers.csv")

    corpus = generate_synthetic_corpus(n_scam=160, n_legit=160)

    # Write CSV
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["text", "language", "label", "scam_type", "source"])
        writer.writeheader()
        writer.writerows(corpus)

    print(f"Generated {len(corpus)} synthetic samples -> {csv_path}")

    # Train and serialize the baseline TF-IDF + Logistic Regression model
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.linear_model import LogisticRegression
        from sklearn.pipeline import Pipeline

        texts = [r["text"] for r in corpus]
        labels = [r["label"] for r in corpus]

        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=2500, sublinear_tf=True)),
            ("clf", LogisticRegression(C=1.5, class_weight="balanced", random_state=42))
        ])
        pipeline.fit(texts, labels)

        model_path = os.path.join(data_dir, "baseline_model.pkl")
        with open(model_path, "wb") as f:
            pickle.dump(pipeline, f)
        print(f"Trained & saved baseline ML model -> {model_path}")
    except Exception as e:
        print(f"ML baseline training note: {e}")


if __name__ == "__main__":
    main()

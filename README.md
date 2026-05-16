# VERIDIAN — Credit Risk Intelligence Platform

> **Clarity. Confidence. Compliance.**

VERIDIAN is a production-grade Credit Risk Intelligence platform that bridges the gap between raw ML output and defensible business intelligence. Built for senior decision-makers, ML auditors, and compliance teams who need more than just a score.

---

## 🧠 What Problem VERIDIAN Solves

Most credit risk systems are **black boxes**. Even when accurate, they fail to answer *why* — hiding systemic biases and failing to signal uncertainty. This leads to:

- **Trust Erosion** — Stakeholders can't verify "Approved" or "Denied" verdicts
- **Compliance Risk** — No auditable fairness metrics or human-readable justifications
- **Strategic Blindness** — No way to simulate "What-If" scenarios or understand decision boundaries

---

## ⚡ System Capabilities

### 1. Calibrated Risk Prediction
Every prediction is clamped to `[0.01, 0.99]`, acknowledging the probabilistic nature of credit risk and avoiding the "100% certainty" fallacy.

### 2. Multi-Tone Explainability (SHAP-Powered)
- **SHAPley Value Vectors** — Precise feature contribution quantification
- **Narrative Intelligence** — NLP layer translating SHAP into **Executive**, **Technical**, and **Simple** tones

### 3. Uncertainty Quantification (OOD Detection)
Signals internal confidence based on model stability and input manifold similarity. Profiles falling into "Out-of-Distribution" zones trigger a **Human-in-the-Loop** flag.

### 4. Quantitative Algorithmic Fairness
Every scan is audited for:
- **DPD** — Demographic Parity Difference
- **EOD** — Equal Opportunity Difference
- **IFS** — Individual Fairness Score

### 5. Adaptive Stress Testing (Simulator)
Real-time What-If exploration — manipulate Loan Amount, Income, and Interest Rate to observe live decision boundary shifts and reconstitution paths for denied applicants.

### 6. Persistent Audit Logs (Governance-Ready)
Every scan is stored in a **local audit log** with CSV export. Formatted for ISO 27001 compliance with vector IDs, confidence scores, and OOD flags.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Vanilla CSS (Space Grotesk + JetBrains Mono) |
| Backend | FastAPI (Python), Uvicorn |
| ML Models | XGBoost, Random Forest, MLP (scikit-learn) |
| Explainability | SHAP |

---

## 🚀 Running Locally

### Backend
```bash
# From project root
pip install -r requirements.txt
python -m uvicorn api.main:app --reload --port 8000
```

### Frontend
```bash
cd ui
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## ⚠️ Limitations

- **Synthetic Foundation** — Trained on anonymized synthetic credit data; requires real-world calibration for specific lending domains
- **Feature Sparsity** — Limited to 13 core features; production systems typically use hundreds of longitudinal data points
- **Static Fairness Thresholds** — Multi-region deployments would require localized parity targets

---

## 🔮 Future Improvements

- **Quantile Regression** — Full interval estimation for robust risk-pricing
- **Adversarial Robustness Testing** — Auto-generation of "adversarial borrowers" to test model security
- **Online Drift Detection** — Real-time concept drift detection with automated retraining triggers
- **Multi-Applicant Batch Scoring** — Upload CSV for bulk analysis and portfolio-level fairness auditing

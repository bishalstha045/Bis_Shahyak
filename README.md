# BIS Sahayak V2 (बीआईएस सहायक) — AI-Powered BIS Compliance Navigator

**Problem Statement:** SIH26107 | Ministry of Consumer Affairs, Food & Public Distribution | Software | Smart Automation  
**Platform Concept:** *From Product → Applicable BIS Standard → Why It Applies → Requirements → Evidence → Compliance Readiness → Next Action*

---

## 🏛️ Executive Summary & Product Vision

**BIS Sahayak V2** is a government-grade compliance decision-support system designed to make India's 22,000+ Bureau of Indian Standards (BIS) documents accessible and actionable for Indian MSMEs, manufacturers, quality assurance teams, and citizens.

Rather than acting as a generic conversational chatbot, **BIS Sahayak V2** functions as an **intelligent compliance navigator**:
```
User / Manufacturer
       │
       ▼
1. Product Understanding & Scope Extraction
   (Product Name, Category, Materials, Characteristics, Intended Purpose)
       │
       ▼
2. Applicable BIS Standards Mapping
   (e.g., IS 17803:2022 / IS 302-2-15:2009 with version, status & amendments)
       │
       ▼
3. Explainability Layer: "Why this standard applies?"
   (Product characteristics match + clause citations)
       │
       ▼
4. Statutory Requirement & Test Matrix
   (Category, Parameter, Test Method, Mandatory QCO Status)
       │
       ▼
5. Evidence & Test Report Document Analysis
   (Extracts text, matches against clauses, identifies gaps & version risks)
       │
       ▼
6. Dual-Metric Evaluation
   ├── AI Grounding Confidence Score (e.g. 94% — backed by gazette records)
   └── Compliance Readiness Score (e.g. 60% — verified test report completeness)
       │
       ▼
7. Actionable Next Step & Official PDF Export
   (e.g. "Upload NABL thermal retention test report under Clause 5.2")
```

---

## 🌟 Core V2 Capabilities

### 1. Product → Applicable Standard Discovery (P0)
- Describe any product in natural language (e.g. *"I manufacture stainless steel water bottles"* or *"Cordless electric kettles"*).
- Automatically extracts material specifications, category, and intended purpose.
- Maps candidate standards with relevance ranking (`High`, `Medium`).

### 2. "Why Does This Standard Apply?" Explainability
- Explains the exact statutory rationale behind each standard mapping.
- Links product parameters (e.g. Food contact SS 304, vacuum insulation) to official gazetted scope.

### 3. Evidence-First RAG & Claim-Level Citations
- Strict zero-hallucination policy.
- Every factual claim maps to a clickable `[Source: IS XXXX:YYYY, Clause X.X, Page X]`.
- Built-in **Evidence Viewer** displays the exact extracted statutory requirement text, test method, and document page.

### 4. Compliance Readiness Engine vs. AI Confidence
- **AI Grounding Confidence (0-100%):** Measures retrieval grounding in official standards.
- **Compliance Readiness (0-100%):** Evaluates the applicant's test certificates and documentation against mandatory clauses.
- Structured **Compliance Requirement Matrix** with statuses: `Complete`, `Needs Review`, `Missing`, `Not Applicable`.

### 5. Document & Test Report Analyzer (P1)
- Upload test certificates, raw material declarations, or lab reports (`.pdf`, `.txt`).
- Automated prompt-injection defense and input sanitization.
- Automatically maps report contents against required standard clauses, flagging missing tests and obsolete version references (e.g., draft vs. current gazette).

### 6. Side-by-Side Standard Comparator
- Structured comparison table comparing any two standards across 11 key attributes (Scope, Regulated Sector, Products, Materials, Lab Testing, Marking, Amendments).
- Highlights hierarchy (Base Standard vs. Particular Appliance Specification).

### 7. Authentic ISI Mark & CML License Verifier
- Validates 7-digit `CM/L-XXXXXXX` licenses against the official BIS repository.
- Transparent, non-overclaiming status messages (*"Licence information found"*, *"Unable to verify"*).

### 8. Multilingual Accessibility & Voice Input
- Native Hindi and 22 Indian languages support.
- Built-in Web Speech API voice query with preservation of technical codes (`IS XXXX`, `CM/L`, `Clause`).

### 9. Data Honesty & Transparency
- Displays the exact number of indexed standards (`Indexed Standards: 14`) in the current verified knowledge base.

---

## 🏗️ System Architecture

```
bis-sahayak/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entry point & CORS
│   │   ├── config.py                   # Pydantic BaseSettings
│   │   ├── routes/
│   │   │   ├── navigator.py            # V2 Product-to-Standard, Compliance & Document APIs
│   │   │   ├── chat.py                 # Grounded chat & SSE streaming
│   │   │   ├── verify.py               # ISI Mark / CML license verifier
│   │   │   ├── export.py               # ReportLab compliance PDF export
│   │   │   ├── search.py               # Direct clause search
│   │   │   └── feedback.py             # Audit trail feedback logger
│   │   ├── services/
│   │   │   ├── product_matcher.py      # Product understanding & standard mapping engine
│   │   │   ├── compliance_engine.py    # Requirement matrix & readiness evaluator
│   │   │   ├── document_analyzer.py    # Test report OCR/text matcher & injection defense
│   │   │   ├── standard_comparator.py  # Structured standard comparator
│   │   │   ├── retriever.py            # Hybrid dense vector + BM25 token retriever
│   │   │   ├── generator.py            # Grounded answer synthesizer
│   │   │   ├── confidence.py           # Multi-factor confidence calculator
│   │   │   ├── translator.py           # Indic language detector & translator
│   │   │   └── audit.py                # SQLite query & audit logging
│   │   └── utils/
│   │       ├── pdf_generator.py        # ReportLab compliance checklist PDF
│   │       └── text_processing.py      # Text normalization & IS extraction
│   ├── data/
│   │   ├── standards_metadata.json     # 14 curated standards with full V2 clause metadata
│   │   ├── indexed_chunks.json         # 50 high-density semantic chunks
│   │   ├── chroma_db/                  # Persistent ChromaDB vector store
│   │   └── bis_sahayak.db              # SQLite query logs & CML license registry
│   └── tests/
│       └── test_v2_api.py              # Automated 8-suite test pipeline
└── frontend/
    └── src/
        ├── components/
        │   ├── Header.jsx              # Government-grade navigation header
        │   ├── Sidebar.jsx             # Workspaces drawer & SIH demo prompts
        │   ├── ComplianceNavigatorView.jsx # Core V2 product -> standard -> matrix flow
        │   ├── ProductToStandardCard.jsx# Product profile & "Why this standard?" drawer
        │   ├── ComplianceMatrix.jsx    # Structured requirement table & dual gauges
        │   ├── ComplianceJourney.jsx   # 6-stage interactive visual workflow
        │   ├── DocumentAnalyzerView.jsx# Upload & requirement matching interface
        │   ├── StandardComparisonView.jsx# Side-by-side standard comparison table
        │   ├── EvidenceModal.jsx       # Official BIS clause & page evidence viewer
        │   ├── ISIVerifierModal.jsx    # CML license validator modal
        │   └── MessageBubble.jsx       # Simple summary + expandable technical details
        ├── services/
        │   └── api.js                  # V2 REST & SSE API client
        └── utils/
            └── constants.js            # Benchmark queries, sample test reports
```

---

## ⚡ Quick Start Guide

### 1. Backend Setup
```bash
cd backend
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run data ingestion pipeline
python -m ingestion.run_pipeline

# Run automated V2 test suite
python tests/test_v2_api.py

# Start FastAPI server on port 8000
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Build for production
npm run build

# Start Vite development server
npm run dev
# Open http://localhost:5173
```

---

## 🎬 SIH 2026 Demo Walkthrough (14-Step Flow)

1. **Step 1:** Enter *"I manufacture stainless steel water bottles."* in the Compliance Navigator.
2. **Step 2:** System identifies product profile: Austenitic SS 304/316, vacuum insulated.
3. **Step 3:** System recommends **IS 17803:2022** (Vacuum Flasks) & **IS 17526:2021** (Single-Walled Bottles).
4. **Step 4:** Click **"Why this standard?"** to inspect matching scope criteria.
5. **Step 5:** Click **"View Evidence"** to inspect official Clause 4.1 (Material) & Clause 5.2 (Thermal Retention).
6. **Step 6:** Inspect the **Compliance Requirement Matrix** and see baseline readiness (30%).
7. **Step 7:** Switch to **Document Analyzer** tab and select the sample *NABL Stainless Steel Flask Test Report*.
8. **Step 8:** Click **"Match Requirements"** — system verifies Clauses 4.1, 5.2, and 6.1.
9. **Step 9:** System updates **Compliance Readiness to 60%** and flags missing Clause 8.1 (Laser Marking).
10. **Step 10:** System provides **Next Best Action**: *"Obtain and attach laser marking artwork to reach 100% readiness"*.
11. **Step 11:** Click **"Export PDF"** to download the official BIS Compliance Checklist.
12. **Step 12:** Switch to **Compare Standards** tab to view side-by-side comparison of **IS 302-2-15** vs. **IS 302 (Part 1)**.
13. **Step 13:** Click **Verify ISI Mark** and validate CML number `CM/L-7128394` (Bajaj Electricals Ltd.).
14. **Step 14:** Switch to **Sahayak AI Chat** and ask in Hindi: *"IS 3196 के बारे में बताइए"*.

---

## 🔒 Security & Guardrails

- **Prompt Injection Defense:** Scans uploaded files for malicious override instructions (`ignore previous instructions`, `bypass bis`) and neutralizes threats.
- **File Validation:** Size limit 10MB, strictly scoped file formats (`.pdf`, `.txt`, `.csv`, `.json`).
- **Data Privacy:** Documents are analyzed in-memory; no proprietary trade secrets or formulas are stored permanently.

---

## 📊 Currently Implemented vs. Future Roadmap

| Feature | Status | Notes |
|---|---|---|
| Product → Standard Mapping | ✅ Implemented | Extracts attributes, maps candidate standards |
| Why-This-Standard Explainability | ✅ Implemented | Clause-level evidence grounding |
| Compliance Readiness Engine | ✅ Implemented | Dual gauges: AI Confidence vs. Readiness % |
| Document Analyzer & Gap Detection | ✅ Implemented | Automatic test report requirement matching |
| Standard Comparator | ✅ Implemented | 11-attribute structured side-by-side comparison |
| ISI / CML License Verifier | ✅ Implemented | CML registry lookup & label inspection |
| ReportLab PDF Checklist Generator | ✅ Implemented | Form V pre-audit downloadable checklist |
| Multilingual & Voice Input | ✅ Implemented | Hindi & English Web Speech API |
| WhatsApp Bot Integration | ⏳ Future Roadmap | Planned for P2 enterprise phase |
| Full 22,000 Standards Scraping | ⏳ Future Roadmap | Requires official BIS NIC database API access |

---

*Built for Smart India Hackathon (SIH 2026) | Problem Statement SIH26107*

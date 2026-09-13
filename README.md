# BIS Sahayak V2 (बीआईएस सहायक) — AI-Powered BIS Compliance Navigator

**Problem Statement:** SIH26107 | Ministry of Consumer Affairs, Food & Public Distribution | Software | Smart Automation  
**Platform Concept:** *From Product / HSN Code → Applicable BIS Standard → Why It Applies → Requirements → Evidence → Compliance Readiness → Verification & Licensing*

> [!IMPORTANT]
> **🚀 Current Deployment Status:**
> **As of now, the frontend UI has been deployed.** The deployed frontend features the complete user interface, interactive Standards Catalog, dual HSN/IS Standards Comparator, full-page Bhashini translation engine, and UI mock/preview workflows. The full backend (FastAPI RAG pipeline, ChromaDB vector store, SQLite registry, and Express JWT bridge) can be run locally using the Quick Start Guide below.

---

## 🏛️ Executive Summary & Product Vision

**BIS Sahayak V2** is a government-grade compliance decision-support system designed to make India's 22,000+ Bureau of Indian Standards (BIS) documents accessible and actionable for Indian MSMEs, manufacturers, quality assurance teams, and citizens.

Rather than acting as a generic conversational chatbot, **BIS Sahayak V2** functions as an **intelligent compliance navigator and verification gateway**:
```
User / Manufacturer / HSN Code
       │
       ▼
1. Product Understanding & Scope Extraction
   (Product Name, Category, Materials, HSN/ITC Code, Intended Purpose)
       │
       ▼
2. Applicable BIS Standards & HSN Mapping
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
7. Verification Dossier Submission & Admin Portal
   (Queued for BIS officer review → CML Licence Generation in National Registry)
       │
       ▼
8. Scoped Statutory Notifications & Actionable Next Steps
   (Personalized alerts for registered enterprise + manufacturer QCO bulletins)
```

---

## 🌟 Core V2 Capabilities

### 1. Product → Applicable Standard Discovery (P0)
- Describe any product in natural language (e.g. *"I manufacture domestic pressure cookers"* or *"Stainless steel insulated water bottles"*).
- Automatically extracts material specifications, category, and intended purpose.
- Maps candidate standards with relevance ranking (`High`, `Medium`).

### 2. "Why Does This Standard Apply?" Explainability
- Explains the exact statutory rationale behind each standard mapping.
- Links product parameters (e.g. Food contact SS 304, vacuum insulation) to official gazetted scope.

### 3. Evidence-First RAG & Claim-Level Citations
- Strict zero-hallucination policy.
- Every factual claim maps to a clickable `[Source: IS XXXX:YYYY, Clause X.X, Page X]`.
- Built-in **Evidence Viewer** displays the exact extracted statutory requirement text, test method, and document page.

### 4. Dual HSN Code & IS Standards Comparator
- Direct cross-matching between Harmonized System Codes (HSN/ITC-HS) and Indian Standards (IS).
- Compares chapter headings, subheadings, mandatory QCO schedules, and clause-by-clause diffs.
- Allows comparing both HSN tariff numbers and IS specifications side by side.

### 5. Compliance Readiness Engine vs. AI Confidence
- **AI Grounding Confidence (0-100%):** Measures retrieval grounding in official standards.
- **Compliance Readiness (0-100%):** Evaluates the applicant's test certificates and documentation against mandatory clauses.
- Structured **Compliance Requirement Matrix** with statuses: `Complete`, `Needs Review`, `Missing`, `Not Applicable`.

### 6. Document & Test Report Analyzer with Relevance Guard
- Upload test certificates, raw material declarations, or lab reports (`.pdf`, `.txt`, `.docx`).
- Automated prompt-injection defense and input sanitization.
- **Relevance & Safety Guard:** Proactively identifies non-compliant or cross-product mismatched documents (e.g. uploading a footwear test report for a pressure cooker) and alerts the user with structured feedback.

### 7. Authentic ISI Mark & CML License Verifier
- Validates 7-digit `CM/L-XXXXXXX` licenses against the official BIS repository.
- Transparent, non-overclaiming status messages (*"Licence information found"*, *"Unable to verify"*).

### 8. Dedicated BIS Officer Admin Control Panel (`/admin`)
- Full administrative control room for Bureau of Indian Standards officials with sub-routes (`/admin/dashboard`, `/admin/verification`, `/admin/users`, `/admin/reports`, `/admin/activity`, `/admin/settings`).
- **Verification Dossier Queue:** Review manufacturer evidence, approve or reject dossiers with deficiency notes.
- **Automated CML Issuance:** Approving a dossier instantly generates an official CM/L license recorded in the National Registry.
- **Grievance Surveillance & Activity Log:** Track market non-compliance reports and statutory audit trails.

### 9. Scoped Statutory & Enterprise Notification Center
- **Data Isolation:** Registered manufacturers only receive notifications for their own enterprise dossiers and licences.
- **Public Bulletins:** Unauthenticated visitors and manufacturers see Gazette Quality Control Orders (QCOs), standard amendments, and NABL laboratory accreditations without leaking other applicants' private submissions.

### 10. Ephemeral In-Memory Authentication & Strict Feature Gating
- Protected tabs (`compliance`, `documents`, `verification`, `admin`) require an active session and cannot be accessed as logged-in without authenticating.
- Pure in-memory session model guarantees that refreshing or reloading the browser resets the session cleanly, matching the privacy and freshness model of the AI chat assistant.

### 11. Bhashini Dynamic Full-Page Translation & Voice Input
- Built-in dynamic full-page translation engine supporting 22 Indian scheduled languages across all DOM elements.
- Web Speech API voice input preserving technical codes (`IS 2347`, `CM/L`, `Clause`).

---

## 🏗️ System Architecture

```
bis-sahayak/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entry point & CORS
│   │   ├── config.py                   # Pydantic BaseSettings
│   │   ├── routes/
│   │   │   ├── navigator.py            # Product-to-Standard, Scoped Notifications & Submissions
│   │   │   ├── chat.py                 # Grounded chat & SSE streaming
│   │   │   ├── verify.py               # ISI Mark / CML license verifier
│   │   │   ├── export.py               # ReportLab compliance PDF export
│   │   │   ├── voice.py                # Audio & voice query handler
│   │   │   └── auth.py                 # JWT authentication & admin demo login
│   │   ├── services/
│   │   │   ├── product_matcher.py      # Product understanding & standard mapping engine
│   │   │   ├── compliance_engine.py    # Requirement matrix & readiness evaluator
│   │   │   ├── document_analyzer.py    # Test report OCR/text matcher & relevance guard
│   │   │   ├── standard_comparator.py  # Dual HSN / IS standard comparator
│   │   │   ├── hsn_catalog.py          # HSN code knowledge catalog
│   │   │   ├── retriever.py            # Hybrid dense vector + BM25 token retriever
│   │   │   ├── generator.py            # Grounded answer synthesizer
│   │   │   ├── confidence.py           # Multi-factor confidence calculator
│   │   │   └── audit.py                # SQLite query & audit logging
│   │   └── models/
│   │       ├── database.py             # SQLite schema, seeded licenses, submissions & notifs
│   │       └── schemas.py              # Pydantic validation schemas
│   ├── src/                            # Express / Node.js Microservices Bridge
│   │   ├── controllers/                # Chat, Document, and RAG controllers
│   │   ├── routes/                     # Submissions, Notifications, and Voice routes
│   │   └── services/                   # Admin, HSN, and RAG microservices
│   ├── data/
│   │   ├── standards_metadata.json     # Curated standards with full clause metadata
│   │   ├── indexed_chunks.json         # High-density semantic vector chunks
│   │   ├── chroma_db/                  # Persistent ChromaDB vector store
│   │   └── bis_sahayak.db              # SQLite query logs, submissions & CML registry
│   └── hs_codes.csv                    # National HSN / ITC-HS codes dataset
└── frontend/
    └── src/
        ├── components/
        │   ├── Header.jsx              # Government-grade header with scoped notification dropdown
        │   ├── Sidebar.jsx             # Navigation drawer & quick actions
        │   ├── HomeDashboardView.jsx   # Public dashboard, quick discovery & BIS metrics
        │   ├── StandardsView.jsx       # Comprehensive standards catalog search & filter
        │   ├── ComplianceView.jsx      # Core product -> standard -> matrix journey
        │   ├── DocumentAnalyzerView.jsx# Upload & test report auditor with relevance popup
        │   ├── VerificationView.jsx    # CML license lookup & official dossier submission studio
        │   ├── StandardComparisonView.jsx # Dual HSN & IS standard side-by-side comparator
        │   ├── NotificationsView.jsx   # Scoped statutory & enterprise notification center
        │   ├── admin/
        │   │   ├── AdminPanel.jsx      # Dedicated BIS official control room with sub-routes
        │   │   ├── AdminDashboard.jsx  # Real-time KPIs & verification queue overview
        │   │   ├── AdminVerification.jsx # Dossier review, deficiency rejection & CML issuance
        │   │   ├── AdminUsers.jsx      # Enterprise user directory
        │   │   ├── AdminReports.jsx    # Grievance surveillance management
        │   │   ├── AdminActivity.jsx   # Statutory audit activity log
        │   │   └── AdminSettings.jsx   # QCO enforcement mode & system parameters
        │   ├── ChatInterface.jsx       # Streaming multi-turn conversational AI
        │   ├── AuthModal.jsx           # Enterprise login, registration & onboarding
        │   ├── ProfileModal.jsx        # Enterprise profile & GSTIN/MSME editor
        │   └── EvidenceModal.jsx       # Official BIS clause & page evidence viewer
        ├── hooks/
        │   ├── useAuth.js              # Ephemeral in-memory auth hook (refresh reset)
        │   ├── useChat.js              # Ephemeral chat state hook
        │   ├── useVoice.js             # Web Speech voice query hook
        │   └── useFullPageTranslation.js # Bhashini dynamic full-page translation hook
        └── services/
            ├── api.js                  # Ephemeral session token API client
            └── supabase.js             # Ephemeral Supabase client (persistSession: false)
```

---

## ⚡ Quick Start Guide

> **Note:** As of now, the frontend UI has been deployed for client demonstrations. To run the complete fullstack platform locally with the live backend RAG pipeline:

### 1. Backend Setup (FastAPI & Vector Engine)
```bash
cd backend
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup (Vite + React)
```bash
cd frontend
# Install dependencies
npm install

# Start Vite development server
npm run dev
# Open http://localhost:5173
```

---

## 🎬 Demo Walkthrough (SIH 2026 Flow)

1. **Step 1:** Explore **Home Dashboard** and search *"I manufacture domestic pressure cookers"*.
2. **Step 2:** System maps product profile to **IS 2347:2017** and explains statutory rationale under QCO Gazette Order 2026.
3. **Step 3:** Inspect the **Compliance Requirement Matrix** to view mandatory testing clauses (Hydrostatic pressure, bursting, fusible plug).
4. **Step 4:** Switch to **Compare Standards** and compare **IS 2347** vs. **IS 17803** or compare with **HSN 7615** (Aluminium kitchenware).
5. **Step 5:** Upload a test report in **Document Analyzer** — system audits clauses and flags missing evidence.
6. **Step 6:** Click **Sign In / Register** in the top navigation to authenticate as an Enterprise Manufacturer.
7. **Step 7:** Open **Verification Studio** — submit a dossier with laboratory test certificates.
8. **Step 8:** Access **Admin Panel (`/admin`)** as a BIS officer to review, approve the dossier, and issue an official **CM/L Licence**.
9. **Step 9:** Open **Notification Center** — see the personalized licence grant alert scoped exclusively to the applicant.
10. **Step 10:** Refresh the browser — session and active content cleanly reset to unauthenticated state, ensuring zero residual cache.

---

## 🔒 Security & Guardrails

- **Ephemeral Session Security:** Auth tokens and user state are maintained in memory; page refreshes reset the session cleanly.
- **Notification & Data Isolation:** Private applicant verification dossiers and licence notifications are strictly isolated by email; unauthenticated visitors cannot view private submissions.
- **Prompt Injection Defense:** Scans uploaded test documents for malicious override commands and neutralizes threats.
- **Document Relevance Verification:** Flags cross-product mismatched files before processing.

---

## 📊 Currently Implemented vs. Future Roadmap

| Feature | Status | Notes |
|---|---|---|
| Frontend UI Deployment | ✅ Deployed | Complete UI deployed for interactive demo & testing |
| Product → Standard Mapping | ✅ Implemented | Extracts attributes, maps candidate standards |
| Why-This-Standard Explainability | ✅ Implemented | Clause-level evidence grounding |
| Compliance Readiness Engine | ✅ Implemented | Dual gauges: AI Confidence vs. Readiness % |
| Document Analyzer & Gap Detection | ✅ Implemented | Automatic test report requirement matching |
| Relevance & Mismatch Popups | ✅ Implemented | Alerts when uploaded document does not match product |
| Dual HSN & IS Standard Comparator | ✅ Implemented | Side-by-side HSN tariff & IS standard comparison |
| Dedicated BIS Admin Portal (`/admin`) | ✅ Implemented | Verification queue, CML issuance & audit logs |
| Scoped Notification Center | ✅ Implemented | User-isolated alerts & public manufacturer bulletins |
| Ephemeral In-Memory Auth | ✅ Implemented | Feature gating & clean session reset on refresh |
| ISI / CML License Verifier | ✅ Implemented | CML registry lookup & validation |
| Bhashini Full-Page Translation | ✅ Implemented | Real-time multi-language translation engine |
| ReportLab PDF Checklist Export | ✅ Implemented | Form V pre-audit downloadable checklist |
| Multilingual & Voice Input | ✅ Implemented | Hindi & English Web Speech API |
| Cloud Vector Store Deployment | ⏳ In Progress | Cloud deployment for distributed vector backend |
| Full 22,000 Standards Scraping | ⏳ Future Roadmap | Requires official BIS NIC database API access |

---

*Built for Smart India Hackathon (SIH 2026) | Problem Statement SIH26107*

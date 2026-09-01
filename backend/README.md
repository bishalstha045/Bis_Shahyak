# BIS Sahayak V2 — Backend API & Services

AI-powered BIS compliance decision support system backend built with Node.js, Express.js, MongoDB/Mongoose, JWT Authentication, and FastAPI RAG integration.

---

## 🏛️ System Architecture

```
Frontend (React + Vite, Port 5173)
       │
       ▼  REST / SSE
Node.js Express Gateway (Port 5000)
       ├── Authentication (JWT, bcrypt, MSME / Org profiles)
       ├── User & Company Profile Management
       ├── Saved Compliance Assessments (MongoDB / Mongoose)
       ├── Document & Evidence Uploads (Multer)
       ├── Notifications & QCO Mandate Alerts Engine
       ├── Chat Session & Message Persistence
       │
       ▼  HTTP / SSE
RAG & Compliance Service (FastAPI, Port 8000)
       ├── Product-to-Standard Scope Extractor
       ├── Why-This-Standard Rationale Engine
       ├── Hybrid BM25 + Dense Vector Search (ChromaDB)
       ├── LLaMA-3.3-70b Synthesis & Citations
       ├── Test Report Clause Analyzer & Injection Defense
       ├── Structured Standard Comparator
       ├── ISI / CML License Verifier
       └── ReportLab Form V Compliance PDF Generator
```

---

## 🛠️ Tech Stack

- **Server Framework:** Node.js & Express.js
- **Database:** MongoDB & Mongoose ODM (with in-memory resilience fallback)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Security:** `helmet`, `cors`, centralized error handling
- **File Uploads:** `multer` (restricted to 10MB, PDF/TXT/CSV/JSON/DOCX)
- **RAG & ML Integration:** Python FastAPI, ChromaDB, Groq LLaMA 3.3

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                     # MongoDB connection with resilient fallback
│   │   └── env.js                    # Environment variable manager
│   ├── controllers/
│   │   ├── auth.controller.js        # Register, login, OTP, assessments
│   │   ├── user.controller.js        # User profile & organization settings
│   │   ├── document.controller.js    # Document upload & clause matching
│   │   ├── chat.controller.js        # Chat persistence & SSE streaming bridge
│   │   ├── notification.controller.js# Regulatory alerts & unread states
│   │   └── rag.controller.js         # Product mapping, compliance matrix, ISI verifier
│   ├── models/
│   │   ├── User.js                   # Enterprise accounts & roles
│   │   ├── Document.js               # Uploaded test reports & extracted clauses
│   │   ├── Conversation.js           # Chat sessions
│   │   ├── Message.js                # Chat messages with confidence & citations
│   │   ├── Notification.js           # QCO notices, amendments, & gap alerts
│   │   └── Assessment.js             # Saved user compliance assessments
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── document.routes.js
│   │   ├── chat.routes.js
│   │   ├── notification.routes.js
│   │   └── rag.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── document.service.js
│   │   ├── chat.service.js
│   │   ├── notification.service.js
│   │   └── rag.service.js            # External RAG API client
│   ├── middleware/
│   │   ├── auth.middleware.js        # Bearer JWT verification
│   │   ├── error.middleware.js       # Central error & 404 handler
│   │   └── upload.middleware.js      # Multer file storage config
│   ├── utils/
│   │   ├── jwt.js                    # Token signing and verification
│   │   ├── password.js               # Bcrypt password hashing
│   │   └── response.js               # Standardized JSON response format
│   └── app.js                        # Express app configuration
├── uploads/                          # Temporary local storage for uploaded evidence
├── server.js                         # Application bootstrap entry point
├── package.json
└── README.md
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment (.env)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/bis_sahayak
JWT_SECRET=your_jwt_secret_key
RAG_API_URL=http://127.0.0.1:8000
```

### 3. Start Server
```bash
# Start Node.js Express Gateway (Port 5000)
npm start
```

---

## 📡 API Reference

### 1. Authentication & Assessments (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register new manufacturer / MSME user |
| `POST` | `/api/auth/login` | No | Login with email and password |
| `GET` | `/api/auth/me` | Bearer | Get authenticated user profile |
| `POST` | `/api/auth/otp/request` | No | Request mobile OTP |
| `POST` | `/api/auth/otp/verify` | No | Verify mobile OTP & login |
| `POST` | `/api/auth/assessments` | Optional | Save compliance readiness assessment |
| `GET` | `/api/auth/assessments` | Optional | Get user's saved assessments |

### 2. Compliance & Standards Navigator (`/api`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Gateway & RAG service health check |
| `GET` | `/api/dataset-stats` | Get count and metadata of indexed BIS standards |
| `POST` | `/api/product-to-standard` | Map natural language product description to candidate standards |
| `POST` | `/api/compliance/evaluate` | Generate statutory requirement matrix and readiness score |
| `POST` | `/api/standards/compare` | 11-attribute structured side-by-side standard comparison |
| `POST` | `/api/verify` | Verify 7-digit ISI / CML licence registry |
| `POST` | `/api/export/pdf` | Generate ReportLab Form V Compliance PDF |

### 3. Document Analyzer (`/api/documents` / `/api/document`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/documents/upload` | Multipart file upload (`file`) with clause gap detection |
| `POST` | `/api/document/analyze` | Direct text / benchmark report requirement matching |
| `GET` | `/api/documents` | List uploaded user documents |
| `GET` | `/api/documents/:id` | Get document audit details |

### 4. Grounded Chat & RAG (`/api/chat`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send question and receive verified citations |
| `POST` | `/api/chat/stream` | Server-Sent Events (SSE) token streaming |
| `GET` | `/api/chat/history` | Retrieve conversation message history |

### 5. Notifications & Alerts (`/api/notifications`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications` | Fetch regulatory notices, QCO orders & gap alerts |
| `PATCH` | `/api/notifications/:id/read` | Mark single notification as read |
| `PATCH` | `/api/notifications/read-all` | Mark all notifications as read |

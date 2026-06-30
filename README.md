# CivicSight AI 🏛️
### Autonomous Municipal Triage & Resilient Civic Reporting Platform

CivicSight AI is a production-hardened, full-stack, autonomous civic-issue triage and routing engine. It empowers citizens to submit localized municipal reports (potholes, water leaks, trash, broken streetlights, graffiti, or other safety concerns) while utilizing **Gemini 3.5 Flash (multimodal vision + reasoning)** to parse visual cues, estimate severity scores, cross-validate authenticity, and automatically route issues to specific city departments.

Designed with **extreme resilience, zero-downtime tolerance, and cloud scalability**, CivicSight AI implements a series of fail-safe layers and intelligent heuristics to guarantee continuous service even during API outages, network congestion, or budget/quota exhaustion.

---

## 🌐 Vision & Roadmap: A Two-Way Civic Information Layer

CivicSight AI is architected as a **two-way civic information layer**. Today, an autonomous Gemini-powered agent triages citizen reports — analysing the photo, geocoding the location, detecting duplicates, scoring severity, and routing to the correct municipal department, with human review for ambiguous cases.

The larger vision closes the loop: with municipal data integration, CivicSight informs citizens *at the moment they report* — which department owns the issue and its realistic response time, and whether the problem is already known (planned maintenance, an active permit, a logged outage) so they can connect with the on-site team or skip a redundant report entirely. The system is built **feed-agnostic**: the agent already cross-references each report's location against an active-works dataset, so swapping today's seeded proxy for a live municipal feed requires no structural change. This is what turns civic reporting from a one-way complaint box into a trusted, two-way information service — and it starts a data flywheel where each real report and each municipal feed makes the platform more useful.

---

## 🚀 Key Architectural Pillars

### 1. Multi-Lingual Vision & Translation Engine (Gemini API)
- **Zero-Translation Surcharge**: Leverages the Gemini API to analyze images and translate citizen reports in a single unified API call, eliminating latency bottlenecks and extra costs.
- **Comprehensive Language Support**: Seamlessly processes and drafts status updates in **8 major regional languages**: English, Hindi (हिंदी), Marathi (मराठी), Tamil (தமிழ்), Telugu (తెలుగు), Bengali (বাংলা), Kannada (ಕನ್ನಡ), and Gujarati (ગુજરાતੀ).

### 2. Double-Dispatch & Dynamic Geo-Duplication
- **Dynamic Duplication Radius**: Instead of a naive uniform radius, duplication thresholds are dynamically calculated based on issue type:
  - `pothole`: **20 meters** (demands exact lane precision so individual craters are repaired).
  - `streetlight`: **30 meters** (reflects standard spacing of lamp posts).
  - `graffiti`: **15 meters** (identifies distinct properties or defaced surfaces).
  - `trash`: **50 meters** (covers standard street corner trash pile boundaries).
  - `water_leak`: **100 meters** (maps whole-block flooding or pipeline ruptures).
- **Consolidation State**: Corroborating reports within these zone boundaries are linked to existing tickets as supplemental citizen evidence instead of creating redundant work orders.

### 3. Dual-Layer Resilient Rate Limiter
- **Cloud-Resilient Firestore Rate Limiter**: Implements horizontal scaling protection. API limits are synchronized across load-balanced instances inside Firestore (`rate_limits` collection).
- **Fail-Safe In-Memory Fallback**: If connection to the cloud database fails or experiences high latency, the rate-limiter automatically falls back to local in-memory buffers to guarantee continuous protection.

### 4. Advanced Weighted Classification Heuristics (Fallback Agent)
- **Zero-Disruption Fallback**: During Google API quota exhaustions or outages, the platform seamlessly swaps to a **weighted semantic text-classification** heuristic (TF-IDF inspired).
- **Weighted Semantic Engine**: Instead of simple substring matching, keywords carry unique weights (e.g., `"गड्ढा"` / `"pothole"` = 5, `"broken road"` = 3) to accurately classify and score reports, guaranteeing 100% autonomous triage continuity.

### 5. Multi-Tier Sub-Categorization for "Other" Issues
To prevent unassigned manual bottlenecks, issues classified under `"other"` are automatically evaluated against a secondary classifier to pinpoint specialized departments:
- `stray_animal` 🐕 ➡️ **Municipal Animal Husbandry & Veterinary Department** (Severity: 6)
- `park_maintenance` 🛝 ➡️ **Parks and Gardens Department** (Severity: 4)
- `unpruned_tree` 🌳 ➡️ **Municipal Tree Authority & Garden Department** (Severity: 7)
- `abandoned_vehicle` 🚗 ➡️ **Traffic Police & RTO Department** (Severity: 5)
- `encroachment` 🏪 ➡️ **Anti-Encroachment Department** (Severity: 6)
- `noise_complaint` 📢 ➡️ **Environmental Protection & Noise Control Cell** (Severity: 5)

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Google Maps Platform.
- **Backend**: Express (Node.js/TypeScript), SSE (Server-Sent Events) for real-time triage log streaming.
- **Database / Cache**: Firebase Firestore (Persistent storage, collaborative live updates, distributed rate-limiting).
- **Artificial Intelligence**: Gemini Developer SDK (`@google/genai`), Gemini 3.5 Flash multimodal vision, Autonomous Triage Agent.
- **Deployment**: Google Cloud Run.

---

## 📂 Project Structure

```
├── server.ts                 # Full-stack Express backend with Vision APIs, Heuristics, & SSE Triage Stream
├── src/
│   ├── App.tsx               # Interactive React application (Maps, Real-Time Logs, Analytics Dashboard)
│   ├── main.tsx              # Application Entry point
│   ├── index.css             # Tailwind CSS Configuration
│   ├── translations.ts       # Multilingual dictionary & department mappings
├── metadata.json             # App manifest and capability definitions
├── .env.example              # Development environment configurations
└── README.md                 # Technical System Blueprint
```

---

## ⚙️ Development & Configuration

### 1. Environment Configuration
To run the server locally or in production, configure a `.env` file containing the following properties:

```env
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_CONFIG=your_firebase_credentials_json_here
```

### 2. Command Scripts

Install base dependencies:
```bash
npm install
```

Run the development environment (supports real-time server hot-reloading via `tsx`):
```bash
npm run dev
```

Build the application bundle (bundles the backend `server.ts` to `dist/server.cjs` and compiles frontend React assets):
```bash
npm run build
```

Start production instance:
```bash
npm start
```

---

## 🛡️ Production Security & Performance Best Practices

1. **Payload Protection**: Maximum incoming JSON payloads are capped at `10mb` (preventing large buffer memory exhaustion while supporting robust high-res photo uploads).
2. **Failure-Resistant Geocoding**: Address geocoding checks automatically fallback to the manual pinned coordinates if the location text is ambiguous or empty.
3. **Optimized DB Access**: Dual mode read/write detects connection dropouts or missing credentials on startup to prevent crashing the server.
4. **Locked Data Layer**: Firestore security rules deny all direct client access; all reads and writes are mediated server-side via the Firebase Admin SDK.
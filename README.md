# 🧠 MethApp Monorepo

> A modular AI-powered application ecosystem built for awareness, analytics, and secure data handling.

---

### ⚙️ Overview

**MethApp** is a multi-package monorepo that combines AI, analytics, and secure cryptography layers.  
Each module serves a distinct domain — from encryption and data core logic to UI and web interfaces.

This architecture follows a **TurboRepo + pnpm workspace** setup for isolated builds, shared utilities, and scalable deployment.

---

### 🏗️ Architecture

MethApp/
├── apps/
│ └── web/ # Frontend (Vite + React + PWA)
│
├── packages/
│ ├── @app/crypto # Crypto Core (AES-GCM, Argon2id, PBKDF2)
│ ├── @meth-awareness/domain-core # Domain logic and entities
│ ├── @meth-awareness/utils # Shared helpers and cross-cutting utilities
│ ├── @meth-awareness/ui # Reusable UI components
│
├── turbo.json # Turbo pipeline configuration
├── package.json # Root workspace package
├── pnpm-workspace.yaml # pnpm monorepo definition
└── tsconfig.json # Root TS configuration

yaml
Copy code

---

### 📦 Packages Summary

| Package | Description | Status |
|----------|--------------|--------|
| **@app/crypto** | Handles KDF derivation, AES-GCM encryption, and secure key wrapping. | ✅ Stable |
| **@meth-awareness/domain-core** | Business logic layer — entities, DTOs, and domain rules. | 🚧 In Progress |
| **@meth-awareness/ui** | Shared UI library for React components. | ✅ Passing |
| **@meth-awareness/utils** | Utility and helper functions (date, format, validation). | ✅ Passing |
| **web** | Frontend PWA built with React + Vite + TypeScript. | ✅ Build-ready |

---

### 🧠 AI-Driven Modules

Future modules integrate AI/ML features for analytics, awareness tracking, and NLP-powered automation.

| Module | Purpose |
|---------|----------|
| `@app/crypto` | Core encryption and secure key management. |
| `@meth-awareness/ai-core` *(planned)* | LLM-powered decision support and pattern recognition. |
| `@meth-awareness/analytics` *(planned)* | Data dashboards and event insight computation. |

---

### 🧰 Tech Stack

| Layer | Technology |
|-------|-------------|
| Language | TypeScript (ES2022) |
| Build System | TurboRepo + pnpm workspaces |
| Frontend | React 18 + Vite 5 + TailwindCSS |
| Backend/Logic | Node.js WebCrypto API |
| Testing | Vitest + Istanbul Coverage |
| Deployment | Vercel / Node Runtime |
| Package Management | pnpm |
| Version Control | Git + GitHub |

---

### 🚀 Setup & Commands

```bash
# 1️⃣ Clone the repository
git clone https://github.com/<your-username>/MethApp.git
cd MethApp

# 2️⃣ Install dependencies (workspace-aware)
pnpm install

# 3️⃣ Build all packages
pnpm -w build

# 4️⃣ Run tests across packages
pnpm -w test

# 5️⃣ Run only one package test
pnpm --filter @app/crypto test

# 6️⃣ Start the web app (local dev)
pnpm --filter web dev
🧪 Testing & Quality
Vitest with full coverage across all modules

Turbo caching for parallel testing

Lint & Type checks enforced in CI/CD

Coverage thresholds:

swift
Copy code
@app/crypto → 89.5% total coverage
UI/Utils/Domain → 100% passing dummy specs
🧾 Acceptance Criteria (Module 1 – @app/crypto)
✅ Derive + wrap/unwrap key using AES-GCM
✅ PBKDF2 fallback validated
✅ 100 % round-trip integrity
✅ No secrets in logs
✅ 89 %+ coverage with Vitest

🧩 Next Modules (Roadmap)
Phase	Module	Description
Module 2	Domain Core	Encapsulate data models & entities
Module 3	Utils	Shared services & cross-cutting logic
Module 4	UI	Build UI component library with Tailwind
Module 5	Web	Integrate frontend + backend + PWA
Module 6	AI Agent Layer	Implement LLM-driven decision engine

🧑‍💻 Developer Notes
Built with Node 20 +

Uses WebCrypto instead of external crypto libs

All packages compile independently

Shared TypeScript config ensures type safety across packages

Tests and builds orchestrated via TurboRepo

🛠️ Scripts Reference
Script	Description
pnpm -w build	Build all packages
pnpm -w test	Run all tests
pnpm --filter @app/crypto build	Build crypto core only
pnpm --filter web dev	Start web frontend in dev mode
pnpm approve-builds	Approve native build scripts (argon2, esbuild)

📜 License
MIT © 2025 MethApp Team

👥 Maintainers
Name	Role	Handle
<YOUR NAME>	Lead Product & Technical Architect	@your-github
MethApp Contributors	Dev & AI Research	—

⭐ Contribute
Pull requests welcome — make sure to:

Create a feature branch from main

Follow commit naming: feat:, fix:, test:, docs:

Run pnpm -w test before pushing

🧭 Status
Area	Status
Crypto Core	✅ Stable
Domain Core	🚧 Ongoing
UI / Utils	✅ Passing
Web App	🧩 Integrating
Agentic AI	🧠 Planned

“MethApp blends AI, data analytics, and strong encryption — crafted to raise awareness, ensure privacy, and empower next-gen decision systems.”

yaml
Copy code

---

### ✅ Next Step

After pasting:

```bash
git add README.md
git commit -m "docs: add root-level README for MethApp monorepo"
git push

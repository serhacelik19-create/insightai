# 📊 InsightAI — AI-Powered Financial Co-Pilot for SMEs

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/OpenRouter-8A2BE2?style=for-the-badge&logo=google-gemini&logoColor=white" alt="OpenRouter" />
</p>

InsightAI is a secure, clean-coded, and modern web application designed for small and medium-sized enterprises (SMEs) to import financial records, simulate operational scenarios, track key performance metrics, and receive context-aware optimization strategies from a personal **AI Financial Co-Pilot**.

Built using **FastAPI** (Python) and **React** (Vite), this project follows strict industry-standard security principles and modular design patterns (Separation of Concerns).

---

## ✨ Features at a Glance

*   **📈 Dynamic Financial Analytics:** Interactive, multi-period line and bar charts tracking Revenue, Expenses, and Profit margin trends.
*   **🤖 Context-Aware AI Co-Pilot:** Chat with `InsightAI` about your business performance. The AI directly accesses your financials, personnel costs, and menu data to suggest strategies.
*   **📋 Integrated Action Board:** Save suggested AI strategies directly to an interactive Kanban Board (To-Do, In-Progress, Completed) with automatic financial impact tracking.
*   **📥 Column-Mapping statement Importer:** Upload Excel or CSV financial statements with a smart mapping interface to align custom file columns to database fields.
*   **🍽️ Menu Engineering (Restaurants):** Track portion cost vs. sale price to flag low-margin items.
*   **👥 Personnel Efficiency Tracker:** Monitor base salaries, overtime hours, and overtime rates.
*   **🔮 Scenario Simulator:** Simulate business decisions (e.g., price modifications, marketing boosts, salary changes) and instantly preview predicted financial changes.

---

## 🔒 Security Hardening

InsightAI is designed with **zero-compromise security constraints**:
*   **XSS Protection:** JWT authentication tokens are written to `HttpOnly`, `SameSite=Lax`, and `Secure` client cookies. JavaScript cannot access or hijack the session.
*   **Data Isolation (Multi-Tenancy):** Database queries are strictly parameterized and user-filtered. Under no circumstances can a user query another business's financials.
*   **Brute-Force Prevention:** IP-based Rate Limiting middleware guards authentication endpoints.
*   **SQL Injection Defense:** Zero dynamic string concatenation in queries. Parametric SQLite operations are isolated in repository layers.

---

## 🛠️ Codebase Architecture

The project strictly follows the **Separation of Concerns (SoC)** design pattern, keeping layers clean and decoupled.

```
├── backend/                  # FastAPI Application
│   ├── config.py             # Centralized settings & Pydantic configurations
│   ├── database.py           # DB Schema & Connection factory
│   ├── security.py           # JWT encryption, hashing & auth dependencies
│   ├── schemas/              # Pydantic Request/Response validation models
│   ├── repositories/         # Isolated DB querying logic (Decoupled SQL)
│   ├── services/             # Core business logic & AI API connectors
│   └── routers/              # HTTP Route controllers (API Gateways)
│
└── frontend/                 # React Application (Vite)
    ├── src/
    │   ├── context/          # Global state (Auth & UI themes)
    │   ├── services/         # Centralized API clients with session cookies
    │   └── components/       # Premium widgets & layout pages
```

---

## 🚀 Setup & Local Development

### 1. Backend Installation
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` directory:
```env
SECRET_KEY=generate_your_random_secret_key
ALGORITHM=HS256
DB_PATH=database.db
# Primary AI Provider (Gemma-4 via OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=google/gemma-4-26b-a4b-it
```

Run the backend server:
```bash
PYTHONPATH=. python main.py
```

### 2. Seed Demo Data (Highly Recommended)
To populate the database with a 12-month historical restaurant statement, personnel overtimes, and menu assets:
```bash
PYTHONPATH=. python seed_db.py
```
*   **Demo Username:** `demo@insightai.com`
*   **Demo Password:** `demo123`

### 3. Frontend Installation
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) on your browser.

---

## 🧪 Running Automated Tests

Run the integration suite (validating JWT cookies, rate limit blocks, and multi-tenant database isolation):

```bash
PYTHONPATH=. backend/venv/bin/python backend/test_api.py
```

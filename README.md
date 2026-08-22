# InsightAI — AI Financial Co-Pilot for SMEs

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/SQLAlchemy-D71000?style=for-the-badge&logo=sqlalchemy&logoColor=white" alt="SQLAlchemy" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/OpenRouter-8A2BE2?style=for-the-badge&logo=google-gemini&logoColor=white" alt="OpenRouter" />
</p>

A web application for small and medium-sized businesses to import financial records, simulate operational scenarios, track key metrics, and get context-aware optimization strategies from an AI co-pilot.

Built with **FastAPI** (Python) and **React** (Vite), following strict separation of concerns across all layers.

---

## Features

- **Financial Analytics:** Multi-period line and bar charts tracking revenue, expenses, and profit trends.
- **AI Co-Pilot:** Conversational interface where the AI accesses your financial data, personnel costs, and menu items to suggest actionable strategies.
- **Action Board:** Save AI-suggested strategies to a Kanban board (To-Do → In Progress → Completed) with financial impact tracking.
- **Statement Importer:** Upload Excel/CSV files with a column-mapping interface to align custom file formats to database fields.
- **Menu Engineering:** Track portion cost vs. sale price to identify low-margin items (restaurant-focused).
- **Personnel Tracker:** Monitor base salaries, overtime hours, and overtime rates.
- **Scenario Simulator:** Model business decisions (price changes, marketing budget increases, salary adjustments) and preview predicted financial impact.

---

## Security

| Measure | Implementation |
|---------|---------------|
| Session hijacking prevention | JWT tokens stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies — inaccessible to JavaScript |
| Data isolation | All queries are parameterized and filtered by authenticated user — no cross-tenant data access |
| Brute-force protection | IP-based rate limiting on authentication endpoints |
| SQL injection defense | Parameterized PostgreSQL queries via SQLAlchemy Engine — no string concatenation |

---

## Architecture

```
├── backend/
│   ├── config.py             # Centralized Pydantic settings
│   ├── database.py           # Schema & PostgreSQL connection factory
│   ├── security.py           # JWT, hashing, auth dependencies
│   ├── schemas/              # Pydantic request/response models
│   ├── repositories/         # Database query layer (isolated SQL)
│   ├── services/             # Business logic & AI API connectors
│   └── routers/              # HTTP route controllers
│
└── frontend/
    └── src/
        ├── context/          # Auth & theme state
        ├── services/         # API clients with session cookies
        └── components/       # UI widgets & page layouts
```

---

## Setup

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
JWT_SECRET=generate_your_random_secret_key
DATABASE_URL=postgresql://localhost/insightai_db
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=google/gemma-4-26b-a4b-it
```

```bash
PYTHONPATH=. python main.py
```

### Seed Demo Data
```bash
PYTHONPATH=. python backend/seed_db.py
```
- **Demo login:** `demo@insightai.com` / `demo123`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

---

## Tests

Run integration tests covering JWT cookie handling, rate limiting, and multi-tenant data isolation:

```bash
PYTHONPATH=. backend/venv/bin/python -m unittest tests/test_api.py
```

---

## License

MIT

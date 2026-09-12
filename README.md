# BudgetBuddy AI

**AI-Powered Personal Finance Coach** — a hackathon project that helps users track spending, understand their financial habits, and get personalized, conversational advice powered by AI.

> See [`TASKS.md`](./TASKS.md) for each team member's exact responsibilities and file ownership.
> See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the git workflow we're using so we don't step on each other's code.

---

## 1. Problem Statement

Financial literacy is a major challenge in Pakistan and many developing countries. Most people don't track their spending, don't know where their money goes each month, and have no easy way to get personalized financial guidance without hiring an expensive financial advisor.

## 2. Proposed Solution

BudgetBuddy AI is a web app that tracks income/expenses and layers multiple AI features on top:
- Automatically categorizes transactions
- Detects unusual spending
- Reads receipts via OCR and logs them automatically
- Predicts next month's spending
- Lets users ask a chatbot questions about their own finances

## 3. Core Features

| Feature | Description | Owner |
|---|---|---|
| Expense/Income Tracking | Manual entry of transactions | Member 2 |
| Visual Dashboard | Charts for spending by category, trends | Member 1 |
| AI Auto-Categorization | Labels transactions (Food, Transport, Bills...) | Member 3 |
| Anomaly Detection | Flags unusually large transactions | Member 3 |
| AI Chat Advisor | Chatbot answering questions about the user's own data | Member 4 |
| Receipt Scanner (OCR) | Scans a receipt photo and auto-fills a transaction | Member 5 |
| Spending Forecast | Predicts next month's spend per category | Member 6 |
| Savings Goal Tracker | Set a target, track progress | Member 6 |

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python (Flask) |
| Database | SQLite |
| Charts | Chart.js |
| Categorization | Keyword dictionary / simple ML classifier |
| Chat Advisor | LLM API (Claude / OpenAI) |
| Receipt OCR | Tesseract OCR / EasyOCR |
| Forecast | Moving average / simple linear regression |

## 5. Project Structure

```
BudgetBuddy-AI/
├── README.md              <- you are here
├── TASKS.md               <- who does what, in detail
├── CONTRIBUTING.md        <- git workflow for the team
├── backend/
│   ├── app.py             <- Flask app entry point + routes (Member 2 owns this file)
│   ├── requirements.txt
│   ├── database/
│   │   └── models.py      <- DB schema (Member 2)
│   └── modules/
│       ├── categorization.py     <- Member 3
│       ├── anomaly_detection.py  <- Member 3
│       ├── chat_advisor.py       <- Member 4
│       ├── ocr_scanner.py        <- Member 5
│       └── forecast.py           <- Member 6
└── frontend/
    ├── login.html         <- Member 1 (UI-only for the demo; wire to real auth later if needed)
    ├── dashboard.html     <- Member 1 — balance, quick actions, spending chart, transactions
    ├── savings.html       <- Member 6 — savings goals page
    ├── assistant.html     <- Member 4 + Member 5 — chat advisor + receipt scanner page
    ├── style.css          <- Member 1 (shared across all pages)
    ├── common.js          <- Member 1 (shared data/helpers — used by every page's JS)
    ├── dashboard.js       <- Member 1
    ├── savings.js         <- Member 6
    ├── assistant.js       <- Member 4 (chat) + Member 5 (OCR)
    └── images/
        └── auth-bg.jpg    <- background photo for the login page
```

The app is split into three pages sharing one nav bar (Dashboard / Savings / Assistant) so multiple people can work on the frontend without editing the same file. `common.js` holds the shared sample data and helper functions — load it before the page-specific script on every page.

Each AI feature lives in its own file inside `backend/modules/`. This means each person can build and test their function independently, then Member 2 wires it into the main Flask routes in `app.py`.

## 6. Setup & Run

```bash
# 1. Clone the repo
git clone <repo-url>
cd BudgetBuddy-AI

# 2. Set up the backend
cd backend
python -m venv venv
source venv/bin/activate   # on Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Run the Flask server
python app.py

# 4. Open the frontend
# Open frontend/login.html in your browser (it redirects to dashboard.html),
# or serve the whole folder with a simple local server:
cd ../frontend
python -m http.server 5500
```

## 7. Database Schema (Simple Version)

**Transactions**

| Column | Type |
|---|---|
| id | INTEGER (Primary Key) |
| amount | FLOAT |
| description | TEXT |
| category | TEXT |
| date | DATE |
| is_anomaly | BOOLEAN |
| source | TEXT — `manual` or `ocr_receipt` |

**Goals**

| Column | Type |
|---|---|
| id | INTEGER (Primary Key) |
| target_amount | FLOAT |
| deadline | DATE |
| current_saved | FLOAT |

## 8. Limitations (mention during the pitch)

- This is a financial *awareness* tool, not a certified financial advisory service
- Categorization accuracy depends on keyword/model coverage
- OCR accuracy depends on receipt image quality — always allow manual edit as a fallback
- The forecast is a simple statistical projection, not a guarantee

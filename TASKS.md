# Task Breakdown — 6 Members

Each member owns specific files so we can all work in parallel without conflicts. Push your work to your own branch (see `CONTRIBUTING.md`) and open a Pull Request when a piece is ready.

---

## Member 1 — Frontend & Dashboard
**Files:** `frontend/index.html`, `frontend/style.css`, `frontend/script.js`

- [ ] Build the main HTML layout: transaction entry form, navigation, overall page structure
- [ ] Style the page with CSS (clean, simple, mobile-friendly if possible)
- [ ] Integrate Chart.js: category-wise spending (pie/bar chart), income-vs-expense trend line
- [ ] Build the anomaly alert banner and the "Next month prediction" display block
- [ ] Wire up JavaScript `fetch()` calls to the Flask backend so the UI updates without full page reloads

---

## Member 2 — Backend & Database
**Files:** `backend/app.py`, `backend/database/models.py`, `backend/requirements.txt`

- [ ] Set up the SQLite database (Transactions table, Goals table) — see schema in `models.py`
- [ ] Build Flask routes: `POST /transactions`, `GET /transactions`, `POST /goals`, `GET /goals`
- [ ] Define and document the JSON request/response format so everyone else can build against it early
- [ ] Wire in the modules from Members 3–6 once they're ready (`categorization.py`, `anomaly_detection.py`, `chat_advisor.py`, `ocr_scanner.py`, `forecast.py`)
- [ ] Handle basic validation (valid amount, valid date) before saving to the database

---

## Member 3 — Categorization & Anomaly Detection
**Files:** `backend/modules/categorization.py`, `backend/modules/anomaly_detection.py`

- [ ] Build the keyword-to-category dictionary (e.g., "careem" → Transport, "foodpanda" → Food)
- [ ] Write `categorize(description: str) -> str` that returns the predicted category
- [ ] (Stretch) Train a simple TF-IDF + Logistic Regression classifier for descriptions the dictionary misses
- [ ] Write `is_anomaly(amount: float, category: str, history: list) -> bool` that flags transactions well above the user's historical average for that category
- [ ] Hand both functions off to Member 2 to call from `app.py`

---

## Member 4 — AI Chat Advisor
**Files:** `backend/modules/chat_advisor.py`, plus the chat widget in `frontend/script.js`

- [ ] Design the prompt template that injects the user's real transaction data into the LLM request
- [ ] Write `get_advice(question: str, transactions: list) -> str` that calls the LLM API and returns a response
- [ ] Build the Flask route `POST /chat` (in coordination with Member 2)
- [ ] Build the simple chat UI (input box + conversation bubbles) in the frontend
- [ ] Test with a range of questions (spending breakdown, saving suggestions, budget check-ins) to confirm answers stay grounded in real data

---

## Member 5 — Receipt Scanner (OCR)
**Files:** `backend/modules/ocr_scanner.py`, plus the upload UI in `frontend/script.js`

- [ ] Add an image upload / camera-capture input on the frontend
- [ ] Set up Tesseract OCR / EasyOCR in `ocr_scanner.py` to extract raw text from a receipt image
- [ ] Write regex/pattern-matching rules to pull out the total amount, vendor name, and date
- [ ] Return the parsed fields as JSON so the frontend can pre-fill the transaction form for user confirmation
- [ ] Coordinate the route (`POST /scan-receipt`) with Member 2

---

## Member 6 — Spending Forecast, Goals & Testing
**Files:** `backend/modules/forecast.py`, plus goal-tracking logic in `backend/app.py` (in coordination with Member 2)

- [ ] Write `forecast_next_month(transactions: list) -> dict` using a moving average or simple linear regression per category
- [ ] Implement the savings goal feature: set target + deadline, track progress, suggest adjustments if falling behind
- [ ] Once modules are integrated, run end-to-end tests across all features (categorization, anomaly detection, chat advisor, OCR, forecast)
- [ ] Prepare the demo script and pitch slides, including sample data that reliably showcases every feature live

---

## Coordination Notes
- **Members 1 and 2 should agree on the API request/response format first** — everyone else builds against that contract.
- If your module isn't ready in time for the full integration, it should degrade gracefully (e.g., app still works without OCR — user just types the transaction manually).
- Merge early and often — don't wait until the last hour to combine everyone's branches.

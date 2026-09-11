// ==========================================================================
// BudgetBuddy AI — Frontend Logic
// Owner: Member 1 (dashboard, goals, chart, transactions)
// Member 4 owns the /chat wiring details, Member 5 owns /scan-receipt details
// ==========================================================================

const API_BASE = "http://localhost:5000";

const CATEGORY_STYLES = {
  Food:       { color: "#FB7185", icon: "🍔" },
  Transport:  { color: "#38BDF8", icon: "🚗" },
  Bills:      { color: "#8B5CF6", icon: "💡" },
  Shopping:   { color: "#FBBF24", icon: "🛍️" },
  Groceries:  { color: "#34D399", icon: "🛒" },
  Other:      { color: "#9CA3AF", icon: "💳" },
};

const GOAL_COLORS = ["#8B5CF6", "#38BDF8", "#34D399", "#FBBF24", "#FB7185", "#0EA5A5"];

// Local state. Starts with sample data so the dashboard looks alive
// immediately — gets replaced the moment the real backend responds.
let transactions = [
  { amount: 1200, description: "Foodpanda order", category: "Food", date: "2026-09-08" },
  { amount: 450, description: "Careem ride", category: "Transport", date: "2026-09-08" },
  { amount: 6000, description: "K-Electric bill", category: "Bills", date: "2026-09-05" },
  { amount: 2200, description: "Daraz order", category: "Shopping", date: "2026-09-03" },
  { amount: 60000, description: "Monthly salary", category: "Income", date: "2026-09-01" },
];

let goals = [
  { name: "Investment", target: 50000, saved: 30000 },
  { name: "Education", target: 40000, saved: 12000 },
  { name: "Travel", target: 25000, saved: 20000 },
  { name: "Emergency Fund", target: 60000, saved: 27000 },
];

let categoryChart = null;

// ---------- Helpers ----------
function money(n) {
  return "Rs. " + Number(n).toLocaleString();
}

function categoryStyle(cat) {
  return CATEGORY_STYLES[cat] || CATEGORY_STYLES.Other;
}

// ---------- Balance ----------
function renderBalance() {
  const income = transactions.filter(t => t.category === "Income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.category !== "Income").reduce((s, t) => s + t.amount, 0);

  document.getElementById("total-income").textContent = money(income);
  document.getElementById("total-expense").textContent = money(expense);
  document.getElementById("total-balance").textContent = money(income - expense);
}

// ---------- Savings Goals ----------
function renderGoals() {
  const row = document.getElementById("goals-row");
  const addCard = document.getElementById("add-goal-card");

  row.querySelectorAll(".goal-card").forEach(el => el.remove());

  goals.forEach((goal, i) => {
    const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100));
    const color = GOAL_COLORS[i % GOAL_COLORS.length];

    const card = document.createElement("div");
    card.className = "goal-card";
    card.innerHTML = `
      <div class="goal-ring" style="background: conic-gradient(${color} ${pct * 3.6}deg, #F0E4D4 0deg);">
        <div style="background:#fff; width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
          ${pct}%
        </div>
      </div>
      <div class="goal-name">${goal.name}</div>
      <div class="goal-amounts">${money(goal.saved)} / ${money(goal.target)}</div>
    `;
    row.insertBefore(card, addCard);
  });
}

// ---------- Spending Breakdown (Chart.js) ----------
function renderChart() {
  const byCategory = {};
  transactions.filter(t => t.category !== "Income").forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(byCategory);
  const data = Object.values(byCategory);
  const colors = labels.map(l => categoryStyle(l).color);

  const ctx = document.getElementById("category-chart");
  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 0 }],
    },
    options: {
      cutout: "68%",
      plugins: { legend: { display: false } },
    },
  });

  const legend = document.getElementById("category-legend");
  const total = data.reduce((a, b) => a + b, 0) || 1;
  legend.innerHTML = labels.map((l, i) => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${colors[i]};"></span>
      <span>${l} — ${Math.round((data[i] / total) * 100)}%</span>
    </div>
  `).join("");
}

// ---------- Transactions list ----------
function renderTransactions() {
  const list = document.getElementById("tx-list");
  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  list.innerHTML = sorted.map(t => {
    const isIncome = t.category === "Income";
    const style = categoryStyle(t.category);
    return `
      <li class="tx-item">
        <div class="tx-icon" style="background:${style.color}22;">${style.icon}</div>
        <div class="tx-meta">
          <div class="tx-desc">${t.description}</div>
          <div class="tx-date">${t.date}</div>
        </div>
        <div class="tx-amount ${isIncome ? "positive" : "negative"}">
          ${isIncome ? "+" : "-"} ${money(t.amount)}
        </div>
      </li>
    `;
  }).join("");
}

function renderAll() {
  renderBalance();
  renderGoals();
  renderChart();
  renderTransactions();
}

// ---------- Panel toggles ----------
function showPanel(id) {
  ["transaction-panel", "receipt-panel", "goal-panel"].forEach(p => {
    document.getElementById(p).classList.toggle("hidden", p !== id);
  });
}

document.getElementById("show-add-transaction").addEventListener("click", () => showPanel("transaction-panel"));
document.getElementById("show-add-income").addEventListener("click", () => showPanel("transaction-panel"));
document.getElementById("show-scan-receipt").addEventListener("click", () => showPanel("receipt-panel"));
document.getElementById("add-goal-trigger").addEventListener("click", () => showPanel("goal-panel"));
document.getElementById("add-goal-card").addEventListener("click", () => showPanel("goal-panel"));
document.getElementById("cancel-transaction").addEventListener("click", () => showPanel(null));
document.getElementById("cancel-goal").addEventListener("click", () => showPanel(null));

// ---------- Add Transaction ----------
document.getElementById("transaction-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("amount").value);
  const description = document.getElementById("description").value;
  const date = document.getElementById("date").value;

  let newTx = { amount, description, category: "Other", date, is_anomaly: false };

  try {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, description, date }),
    });
    newTx = await res.json();
  } catch (err) {
    console.warn("Backend not reachable yet — using local fallback.", err);
  }

  transactions.push(newTx);

  if (newTx.is_anomaly) {
    const alertBox = document.getElementById("anomaly-alert");
    alertBox.textContent = "⚠️ This transaction looks unusually high compared to your history.";
    alertBox.classList.remove("hidden");
  }

  e.target.reset();
  showPanel(null);
  renderAll();
});

// ---------- Add Goal ----------
document.getElementById("goal-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("goal-name").value;
  const target = parseFloat(document.getElementById("goal-target").value);

  // TODO (Member 2/6): POST this to /goals once the backend route is ready
  goals.push({ name, target, saved: 0 });

  e.target.reset();
  showPanel(null);
  renderGoals();
});

// ---------- Receipt Scanner ----------
document.getElementById("scan-btn").addEventListener("click", async () => {
  const fileInput = document.getElementById("receipt-upload");
  if (!fileInput.files.length) return;

  const formData = new FormData();
  formData.append("receipt", fileInput.files[0]);

  try {
    const res = await fetch(`${API_BASE}/scan-receipt`, { method: "POST", body: formData });
    const extracted = await res.json();
    document.getElementById("amount").value = extracted.amount || "";
    document.getElementById("description").value = extracted.vendor || "";
    document.getElementById("date").value = extracted.date || "";
    showPanel("transaction-panel");
  } catch (err) {
    console.warn("OCR backend not reachable yet.", err);
  }
});

// ---------- Chat Advisor ----------
function addChatBubble(text, sender) {
  const log = document.getElementById("chat-log");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = text;
  log.appendChild(bubble);
  log.scrollTop = log.scrollHeight;
}

document.getElementById("chat-send").addEventListener("click", sendChat);
document.getElementById("chat-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendChat();
});

async function sendChat() {
  const input = document.getElementById("chat-input");
  const question = input.value.trim();
  if (!question) return;

  addChatBubble(question, "user");
  input.value = "";

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    addChatBubble(data.answer, "bot");
  } catch (err) {
    addChatBubble("I'll be able to answer this once the backend is connected!", "bot");
  }
}

// ---------- Init ----------
async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/transactions`);
    const data = await res.json();
    if (Array.isArray(data) && data.length) transactions = data;
  } catch (err) {
    console.warn("Backend not reachable — showing sample data.", err);
  }
  renderAll();
}

loadDashboard();
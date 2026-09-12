// ==========================================================================
// BudgetBuddy AI — Dashboard Page Logic
// Owner: Member 1
// Depends on common.js being loaded first (money, categoryStyle, transactions)
// ==========================================================================

let categoryChart = null;

function renderBalance() {
  const income = transactions.filter(t => t.category === "Income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.category !== "Income").reduce((s, t) => s + t.amount, 0);

  document.getElementById("total-income").textContent = money(income);
  document.getElementById("total-expense").textContent = money(expense);
  document.getElementById("total-balance").textContent = money(income - expense);
}

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
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
    options: { cutout: "68%", plugins: { legend: { display: false } } },
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
  renderChart();
  renderTransactions();
}

// ---------- Panel toggle ----------
function showPanel(show) {
  document.getElementById("transaction-panel").classList.toggle("hidden", !show);
}

document.getElementById("show-add-transaction").addEventListener("click", () => showPanel(true));
document.getElementById("show-add-income").addEventListener("click", () => showPanel(true));
document.getElementById("cancel-transaction").addEventListener("click", () => showPanel(false));

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
  showPanel(false);
  renderAll();
});

// ---------- Init ----------
(async function init() {
  await loadTransactions();
  renderAll();
})();

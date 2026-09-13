let categoryChart = null;
let transactionType = "expense";
let editingTxId = null;

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
      <li class="tx-item" data-id="${t.id}">
        <div class="tx-icon" style="background:${style.color}22;">${style.icon}</div>
        <div class="tx-meta">
          <div class="tx-desc">${t.description}</div>
          <div class="tx-date">${t.date}</div>
        </div>
        <div class="tx-amount ${isIncome ? "positive" : "negative"}">
          ${isIncome ? "+" : "-"} ${money(t.amount)}
        </div>
        <div class="tx-actions">
          <button class="icon-btn edit-tx" title="Edit">✏️</button>
          <button class="icon-btn delete-tx" title="Delete">🗑️</button>
        </div>
      </li>
    `;
  }).join("");

  list.querySelectorAll(".edit-tx").forEach(btn => {
    btn.addEventListener("click", (e) => editTransaction(e.target.closest(".tx-item").dataset.id));
  });
  list.querySelectorAll(".delete-tx").forEach(btn => {
    btn.addEventListener("click", (e) => deleteTransaction(e.target.closest(".tx-item").dataset.id));
  });
}

function renderAll() {
  renderBalance();
  renderChart();
  renderTransactions();
}

// ---------- Panel toggle + expense/income mode ----------
const expenseBtn = document.getElementById("show-add-transaction");
const incomeBtn = document.getElementById("show-add-income");
const panelTitle = document.getElementById("transaction-panel-title");
const descInput = document.getElementById("description");
const saveBtn = document.getElementById("save-transaction-btn");
const categorySelect = document.getElementById("tx-category");

function showPanel(show) {
  document.getElementById("transaction-panel").classList.toggle("hidden", !show);
}

function setActiveButton(type) {
  expenseBtn.classList.toggle("active", type === "expense");
  incomeBtn.classList.toggle("active", type === "income");
}

function setPanelMode(type) {
  transactionType = type;
  setActiveButton(type);
  if (type === "income") {
    panelTitle.textContent = editingTxId ? "Edit Income" : "Add Income";
    descInput.placeholder = "Description (e.g. Monthly salary)";
    saveBtn.textContent = editingTxId ? "Update Income" : "Save Income";
    categorySelect.classList.add("hidden");
  } else {
    panelTitle.textContent = editingTxId ? "Edit Expense" : "Add Expense";
    descInput.placeholder = "Description (e.g. Careem ride)";
    saveBtn.textContent = editingTxId ? "Update Expense" : "Save Expense";
    categorySelect.classList.remove("hidden");
  }
}

expenseBtn.addEventListener("click", () => { editingTxId = null; setPanelMode("expense"); showPanel(true); });
incomeBtn.addEventListener("click", () => { editingTxId = null; setPanelMode("income"); showPanel(true); });
document.getElementById("cancel-transaction").addEventListener("click", () => {
  showPanel(false);
  editingTxId = null;
});

// ---------- Edit ----------
function editTransaction(id) {
  const tx = transactions.find(t => t.id == id);
  if (!tx) return;
  editingTxId = id;
  const type = tx.category === "Income" ? "income" : "expense";
  setPanelMode(type);
  document.getElementById("amount").value = tx.amount;
  document.getElementById("description").value = tx.description;
  document.getElementById("date").value = tx.date;
  if (type === "expense") categorySelect.value = tx.category;
  showPanel(true);
}

// ---------- Delete ----------
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;
  try {
    await fetch(`${API_BASE}/api/transactions/${id}`, { method: "DELETE", headers: authHeaders() });
  } catch (err) {
    console.warn("Backend not reachable — removing locally only.", err);
  }
  transactions = transactions.filter(t => t.id != id);
  renderAll();
}

// ---------- Add / Update Transaction ----------
document.getElementById("transaction-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("amount").value);
  const description = document.getElementById("description").value;
  const date = document.getElementById("date").value;
  const category = transactionType === "income" ? "Income" : categorySelect.value;
  const payload = { amount, description, date, category };

  if (editingTxId) {
    let updatedTx = { ...payload, id: editingTxId };
    try {
      const res = await fetch(`${API_BASE}/api/transactions/${editingTxId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      updatedTx = await res.json();
    } catch (err) {
      console.warn("Backend not reachable — updating locally only.", err);
    }
    const idx = transactions.findIndex(t => t.id == editingTxId);
    if (idx !== -1) transactions[idx] = updatedTx;
    editingTxId = null;
  } else {
    let newTx = { ...payload, id: Date.now(), is_anomaly: false };
    try {
      const res = await fetch(`${API_BASE}/api/transactions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
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
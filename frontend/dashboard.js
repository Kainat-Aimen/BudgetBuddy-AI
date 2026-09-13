let categoryChart = null;
let transactionType = "expense";
let editingTxId = null;
let editingBudgetId = null;
let currentBudgets = [];


// ---------- Dashboard balance ----------
async function renderBalance() {
  try {
    const response = await fetch(
      `${API_BASE}/api/dashboard/summary`,
      {
        method: "GET",
        headers: authHeaders()
      }
    );

    const data = await response.json();

    if (response.status === 401 || response.status === 422) {
      redirectToLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(
        data.error || "Could not load balance"
      );
    }

    document.getElementById("total-income").textContent =
      money(data.total_income);

    document.getElementById("total-expense").textContent =
      money(data.total_expenses);

    document.getElementById("total-balance").textContent =
      money(data.current_balance);
  } catch (error) {
    console.error("Balance error:", error);
  }
}


// ---------- Spending chart ----------
async function renderChart() {
  try {
    const response = await fetch(
      `${API_BASE}/api/dashboard/spending-by-category`,
      {
        method: "GET",
        headers: authHeaders()
      }
    );

    const result = await response.json();

    if (response.status === 401 || response.status === 422) {
      redirectToLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(
        result.error || "Could not load chart"
      );
    }

    const categories = result.categories || [];

    const labels = categories.map(
      item => item.category
    );

    const chartData = categories.map(
      item => Number(item.total)
    );

    const colors = labels.map(
      label => categoryStyle(label).color
    );

    const canvas = document.getElementById(
      "category-chart"
    );

    if (categoryChart) {
      categoryChart.destroy();
    }

    categoryChart = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data: chartData,
          backgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        cutout: "68%",
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    const legend = document.getElementById(
      "category-legend"
    );

    const total = chartData.reduce(
      (sum, amount) => sum + amount,
      0
    );

    legend.innerHTML = labels.map((label, index) => {
      const percentage = total > 0
        ? Math.round(
          (chartData[index] / total) * 100
        )
        : 0;

      return `
        <div class="legend-item">
          <span
            class="legend-dot"
            style="background:${colors[index]}"
          ></span>

          <span>
            ${label} — ${percentage}%
          </span>
        </div>
      `;
    }).join("");
  } catch (error) {
    console.error("Chart error:", error);
  }
}


// ---------- Transaction list ----------
function renderTransactions() {
  const list = document.getElementById("tx-list");

  const sortedTransactions = [...transactions]
    .sort(
      (first, second) =>
        new Date(second.date) - new Date(first.date)
    )
    .slice(0, 6);

  if (!sortedTransactions.length) {
    list.innerHTML = `
      <li class="tx-empty">
        No transactions added yet.
      </li>
    `;
    return;
  }

  list.innerHTML = sortedTransactions.map(transaction => {
    const isIncome = transaction.type === "income";
    const style = categoryStyle(transaction.category);

    return `
      <li
        class="tx-item"
        data-id="${transaction.id}"
      >
        <div
          class="tx-icon"
          style="background:${style.color}22"
        >
          ${style.icon}
        </div>

        <div class="tx-meta">
          <div class="tx-desc">
            ${transaction.description || transaction.category}
          </div>

          <div class="tx-date">
            ${transaction.date}
          </div>
        </div>

        <div
          class="tx-amount ${isIncome ? "positive" : "negative"
      }"
        >
          ${isIncome ? "+" : "-"}
          ${money(transaction.amount)}
        </div>

        <div class="tx-actions">
          <button
            type="button"
            class="icon-btn edit-tx"
            title="Edit"
          >
            ✏️
          </button>

          <button
            type="button"
            class="icon-btn delete-tx"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </li>
    `;
  }).join("");

  list.querySelectorAll(".edit-tx").forEach(button => {
    button.addEventListener("click", event => {
      const item = event.target.closest(".tx-item");
      editTransaction(item.dataset.id);
    });
  });

  list.querySelectorAll(".delete-tx").forEach(button => {
    button.addEventListener("click", event => {
      const item = event.target.closest(".tx-item");
      deleteTransaction(item.dataset.id);
    });
  });
}


async function renderAll() {
  await renderBalance();
  await renderChart();
  renderTransactions();
}


// ---------- Transaction panel ----------
const expenseBtn = document.getElementById(
  "show-add-transaction"
);

const incomeBtn = document.getElementById(
  "show-add-income"
);

const panelTitle = document.getElementById(
  "transaction-panel-title"
);

const descInput = document.getElementById(
  "description"
);

const saveBtn = document.getElementById(
  "save-transaction-btn"
);

const categorySelect = document.getElementById(
  "tx-category"
);


function showPanel(show) {
  document
    .getElementById("transaction-panel")
    .classList.toggle("hidden", !show);
}


function setActiveButton(type) {
  expenseBtn.classList.toggle(
    "active",
    type === "expense"
  );

  incomeBtn.classList.toggle(
    "active",
    type === "income"
  );
}


function setPanelMode(type) {
  transactionType = type;
  setActiveButton(type);

  if (type === "income") {
    panelTitle.textContent = editingTxId
      ? "Edit Income"
      : "Add Income";

    descInput.placeholder =
      "Description (e.g. Monthly salary)";

    saveBtn.textContent = editingTxId
      ? "Update Income"
      : "Save Income";

    categorySelect.classList.add("hidden");
  } else {
    panelTitle.textContent = editingTxId
      ? "Edit Expense"
      : "Add Expense";

    descInput.placeholder =
      "Description (e.g. Careem ride)";

    saveBtn.textContent = editingTxId
      ? "Update Expense"
      : "Save Expense";

    categorySelect.classList.remove("hidden");
  }
}


expenseBtn.addEventListener("click", () => {
  editingTxId = null;
  setPanelMode("expense");
  showPanel(true);
});


incomeBtn.addEventListener("click", () => {
  editingTxId = null;
  setPanelMode("income");
  showPanel(true);
});


document
  .getElementById("cancel-transaction")
  .addEventListener("click", () => {
    showPanel(false);
    editingTxId = null;
  });


// ---------- Edit transaction ----------
function editTransaction(id) {
  const transaction = transactions.find(
    item => item.id == id
  );

  if (!transaction) return;

  editingTxId = id;
  setPanelMode(transaction.type);

  document.getElementById("amount").value =
    transaction.amount;

  document.getElementById("description").value =
    transaction.description || "";

  document.getElementById("date").value =
    transaction.date;

  if (transaction.type === "expense") {
    categorySelect.value = transaction.category;
  }

  showPanel(true);
}


// ---------- Delete transaction ----------
async function deleteTransaction(id) {
  try {
    const response = await fetch(
      `${API_BASE}/api/transactions/${id}`,
      {
        method: "DELETE",
        headers: authHeaders()
      }
    );

    const data = await response.json();

    if (response.status === 401 || response.status === 422) {
      redirectToLogin();
      return;
    }

    if (!response.ok) {
      showToast(
        data.error ||
        data.msg ||
        "Could not delete transaction",
        "error"
      );
      return;
    }

    await loadTransactions();
    await renderAll();

    showToast(
      data.message || "Transaction deleted"
    );
  } catch (error) {
    console.error("Delete transaction error:", error);

    showToast(
      "Cannot connect to the backend server",
      "error"
    );
  }
}


// ---------- Add or update transaction ----------
document
  .getElementById("transaction-form")
  .addEventListener("submit", async event => {
    event.preventDefault();

    const wasEditing = Boolean(editingTxId);

    const payload = {
      type: transactionType,

      amount: Number(
        document.getElementById("amount").value
      ),

      description: document
        .getElementById("description")
        .value
        .trim(),

      date: document
        .getElementById("date")
        .value,

      category: transactionType === "income"
        ? "Income"
        : categorySelect.value
    };

    const url = wasEditing
      ? `${API_BASE}/api/transactions/${editingTxId}`
      : `${API_BASE}/api/transactions`;

    try {
      const response = await fetch(url, {
        method: wasEditing ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (
        response.status === 401 ||
        response.status === 422
      ) {
        redirectToLogin();
        return;
      }

      if (!response.ok) {
        showToast(
          data.error ||
          data.msg ||
          "Could not save transaction",
          "error"
        );
        return;
      }

      editingTxId = null;
      event.target.reset();
      showPanel(false);

      await loadTransactions();
      await loadBudgetStatus();
      await renderAll();

      showToast(
        data.message ||
        (
          wasEditing
            ? "Transaction updated"
            : "Transaction saved"
        )
      );
    } catch (error) {
      console.error("Transaction error:", error);

      showToast(
        "Cannot connect to the backend server",
        "error"
      );
    }
  });


// ---------- Budget status ----------
async function loadBudgetStatus() {
  try {
    const response = await fetch(
      `${API_BASE}/api/budgets/status`,
      {
        method: "GET",
        headers: authHeaders()
      }
    );

    const data = await response.json();

    if (response.status === 401 || response.status === 422) {
      redirectToLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(
        data.error || "Could not load budgets"
      );
    }

    renderBudgetStatus(data.budgets || []);
  } catch (error) {
    console.error("Budget error:", error);
  }
}


function renderBudgetStatus(budgets) {
  currentBudgets = budgets;

  const list = document.getElementById(
    "budget-status-list"
  );

  if (!budgets.length) {
    list.innerHTML = "<p>No budgets created yet.</p>";
    return;
  }

  list.innerHTML = budgets.map(budget => {
    const limit = Number(budget.limit_amount || 0);
    const spent = Number(budget.spent || 0);
    const remaining = Number(budget.remaining || 0);

    const percentage = Math.min(
      100,
      Number(
        budget.percentage ??
        budget.percentage_used ??
        0
      )
    );

    return `
      <div class="budget-status-card">
        <div class="budget-status-head">
          <h3>${budget.category}</h3>

          <div class="budget-actions">
            <button
              type="button"
              class="budget-edit"
              data-id="${budget.id}"
              title="Edit budget"
            >
              ✏️
            </button>

            <button
              type="button"
              class="budget-delete"
              data-id="${budget.id}"
              title="Delete budget"
            >
              🗑️
            </button>
          </div>
        </div>

        <strong>${money(remaining)} remaining</strong>

        <div class="budget-progress">
          <div
            class="budget-progress-fill"
            style="width:${percentage}%"
          ></div>
        </div>

        <div class="budget-numbers">
          <span>Spent: ${money(spent)}</span>
          <span>Limit: ${money(limit)}</span>
        </div>
      </div>
    `;
  }).join("");

  list.querySelectorAll(".budget-edit").forEach(button => {
    button.addEventListener("click", () => {
      editBudget(button.dataset.id);
    });
  });

  list.querySelectorAll(".budget-delete").forEach(button => {
    button.addEventListener("click", () => {
      deleteBudget(button.dataset.id);
    });
  });
}


// ---------- Add budget ----------
// ---------- Edit budget ----------
function editBudget(id) {
  const budget = currentBudgets.find(
    item => item.id == id
  );

  if (!budget) return;

  editingBudgetId = id;

  document.getElementById("budget-category").value =
    budget.category;

  document.getElementById("budget-limit").value =
    budget.limit_amount;

  document.getElementById("budget-month").value =
    budget.month;

  document.getElementById("budget-save-btn").textContent =
    "Update Budget";

  document
    .getElementById("budget-cancel-btn")
    .classList.remove("hidden");

  document
    .getElementById("budget-form")
    .scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
}


// ---------- Reset budget form ----------
function resetBudgetForm() {
  editingBudgetId = null;

  document.getElementById("budget-form").reset();

  document.getElementById("budget-save-btn").textContent =
    "Save Budget";

  document
    .getElementById("budget-cancel-btn")
    .classList.add("hidden");

  setDefaultBudgetMonth();
}


document
  .getElementById("budget-cancel-btn")
  .addEventListener("click", resetBudgetForm);


// ---------- Add or update budget ----------
document
  .getElementById("budget-form")
  .addEventListener("submit", async event => {
    event.preventDefault();

    const wasEditing = Boolean(editingBudgetId);

    const payload = {
      category: document
        .getElementById("budget-category")
        .value,

      limit_amount: Number(
        document.getElementById("budget-limit").value
      ),

      month: document
        .getElementById("budget-month")
        .value
    };

    const url = wasEditing
      ? `${API_BASE}/api/budgets/${editingBudgetId}`
      : `${API_BASE}/api/budgets`;

    try {
      const response = await fetch(url, {
        method: wasEditing ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (
        response.status === 401 ||
        response.status === 422
      ) {
        redirectToLogin();
        return;
      }

      if (!response.ok) {
        showToast(
          data.error ||
          data.msg ||
          "Could not save budget",
          "error"
        );
        return;
      }

      resetBudgetForm();
      await loadBudgetStatus();

      showToast(
        data.message ||
        (
          wasEditing
            ? "Budget updated successfully"
            : "Budget saved successfully"
        )
      );
    } catch (error) {
      console.error("Budget error:", error);

      showToast(
        "Cannot connect to the backend server",
        "error"
      );
    }
  });


// ---------- Delete budget ----------
async function deleteBudget(id) {
  try {
    const response = await fetch(
      `${API_BASE}/api/budgets/${id}`,
      {
        method: "DELETE",
        headers: authHeaders()
      }
    );

    const data = await response.json();

    if (
      response.status === 401 ||
      response.status === 422
    ) {
      redirectToLogin();
      return;
    }

    if (!response.ok) {
      showToast(
        data.error ||
        data.msg ||
        "Could not delete budget",
        "error"
      );
      return;
    }

    if (editingBudgetId == id) {
      resetBudgetForm();
    }

    await loadBudgetStatus();

    showToast(
      data.message || "Budget deleted"
    );
  } catch (error) {
    console.error("Delete budget error:", error);

    showToast(
      "Cannot connect to the backend server",
      "error"
    );
  }
}


// ---------- Default budget month ----------
function setDefaultBudgetMonth() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  document.getElementById("budget-month").value =
    `${year}-${month}`;
}


// ---------- Start dashboard ----------
(async function init() {
  setDefaultBudgetMonth();

  await loadTransactions();
  await loadBudgetStatus();
  await renderAll();
})();
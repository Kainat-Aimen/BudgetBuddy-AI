// BudgetBuddy AI - Frontend Logic
// Owner: Member 1 (dashboard + form wiring)
// Member 5 owns the receipt-scan block below
// Member 4 owns the chat-advisor block below

const API_BASE = "http://localhost:5000";

// ---------- Add Transaction ----------
document.getElementById("transaction-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const amount = document.getElementById("amount").value;
  const description = document.getElementById("description").value;
  const date = document.getElementById("date").value;

  const res = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: parseFloat(amount), description, date }),
  });
  const data = await res.json();

  if (data.is_anomaly) {
    const alertBox = document.getElementById("anomaly-alert");
    alertBox.textContent = "⚠️ This transaction looks unusually high compared to your history.";
    alertBox.classList.remove("hidden");
  }

  // TODO (Member 1): refresh the dashboard chart after adding a transaction
  loadDashboard();
});

// ---------- Dashboard ----------
async function loadDashboard() {
  const res = await fetch(`${API_BASE}/transactions`);
  const transactions = await res.json();

  // TODO (Member 1): aggregate `transactions` by category and render with Chart.js
  // Example skeleton:
  // new Chart(document.getElementById('category-chart'), {
  //   type: 'pie',
  //   data: { labels: [...], datasets: [{ data: [...] }] }
  // });

  const forecastRes = await fetch(`${API_BASE}/forecast`);
  const forecast = await forecastRes.json();
  document.getElementById("forecast-box").textContent =
    "Predicted next month: " + JSON.stringify(forecast);
}

loadDashboard();

// ---------- Receipt Scanner (Member 5) ----------
document.getElementById("scan-btn").addEventListener("click", async () => {
  const fileInput = document.getElementById("receipt-upload");
  if (!fileInput.files.length) return;

  const formData = new FormData();
  formData.append("receipt", fileInput.files[0]);

  const res = await fetch(`${API_BASE}/scan-receipt`, {
    method: "POST",
    body: formData,
  });
  const extracted = await res.json();

  // TODO (Member 5): pre-fill the transaction form with `extracted` fields
  document.getElementById("amount").value = extracted.amount || "";
  document.getElementById("description").value = extracted.vendor || "";
  document.getElementById("date").value = extracted.date || "";
});

// ---------- Chat Advisor (Member 4) ----------
document.getElementById("chat-send").addEventListener("click", async () => {
  const input = document.getElementById("chat-input");
  const question = input.value.trim();
  if (!question) return;

  const chatLog = document.getElementById("chat-log");
  chatLog.innerHTML += `<p><b>You:</b> ${question}</p>`;
  input.value = "";

  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  const data = await res.json();

  chatLog.innerHTML += `<p><b>BudgetBuddy:</b> ${data.answer}</p>`;
});

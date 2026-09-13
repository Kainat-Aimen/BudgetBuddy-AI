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

let transactions = [
  { id: 1, amount: 1200, description: "Foodpanda order", category: "Food", date: "2026-09-08" },
  { id: 2, amount: 450, description: "Careem ride", category: "Transport", date: "2026-09-08" },
  { id: 3, amount: 6000, description: "K-Electric bill", category: "Bills", date: "2026-09-05" },
  { id: 4, amount: 2200, description: "Daraz order", category: "Shopping", date: "2026-09-03" },
  { id: 5, amount: 60000, description: "Monthly salary", category: "Income", date: "2026-09-01" },
];

let goals = [
  { id: 1, name: "Investment", target: 50000, saved: 30000 },
  { id: 2, name: "Education", target: 40000, saved: 12000 },
  { id: 3, name: "Travel", target: 25000, saved: 20000 },
  { id: 4, name: "Emergency Fund", target: 60000, saved: 27000 },
];

function money(n) {
  return "Rs. " + Number(n).toLocaleString();
}

function categoryStyle(cat) {
  return CATEGORY_STYLES[cat] || CATEGORY_STYLES.Other;
}

// Sends the saved login token with every backend request.
function authHeaders() {
  const token = localStorage.getItem("budgetbuddy_token");
  return token
    ? { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

async function loadTransactions() {
  try {
    const res = await fetch(`${API_BASE}/api/transactions`, { headers: authHeaders() });
    const data = await res.json();
    if (Array.isArray(data) && data.length) transactions = data;
  } catch (err) {
    console.warn("Backend not reachable — using sample data.", err);
  }
}

async function loadGoals() {
  try {
    const res = await fetch(`${API_BASE}/api/goals`, { headers: authHeaders() });
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      goals = data.map(g => ({
        id: g.id,
        name: g.name,
        target: g.target_amount,
        saved: g.current_saved,
        deadline: g.deadline,
      }));
    }
  } catch (err) {
    console.warn("Backend not reachable — using sample goals.", err);
  }
}

// ---------- Sidebar user info ----------
function renderSidebarUser() {
  const name = localStorage.getItem("budgetbuddy_user_name") || "Guest";
  const initial = name.charAt(0).toUpperCase();
  document.querySelectorAll(".sidebar-footer .avatar").forEach(el => el.textContent = initial);
  document.querySelectorAll(".sidebar-footer .avatar-name").forEach(el => el.textContent = name);
}
renderSidebarUser();
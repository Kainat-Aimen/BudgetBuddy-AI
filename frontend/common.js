// ==========================================================================
// BudgetBuddy AI — Shared/Common Logic
// Used by dashboard.js, savings.js, and assistant.js
// Owner: Member 1 (keep this file's exports stable — others depend on it)
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

// Sample data so every page looks alive before the backend is connected.
// Replace with real fetch() calls once Member 2's routes are ready.
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

function money(n) {
  return "Rs. " + Number(n).toLocaleString();
}

function categoryStyle(cat) {
  return CATEGORY_STYLES[cat] || CATEGORY_STYLES.Other;
}

// Loads transactions from the backend if it's reachable; otherwise keeps
// the sample data above. Call this at the top of each page's init function.
async function loadTransactions() {
  try {
    const res = await fetch(`${API_BASE}/transactions`);
    const data = await res.json();
    if (Array.isArray(data) && data.length) transactions = data;
  } catch (err) {
    console.warn("Backend not reachable — using sample data.", err);
  }
}

// TODO (Member 2/6): once the backend's /goals route returns a 'name' field
// too, swap this for a real fetch() the same way loadTransactions() works.
async function loadGoals() {
  try {
    const res = await fetch(`${API_BASE}/goals`);
    const data = await res.json();
    if (Array.isArray(data) && data.length) goals = data;
  } catch (err) {
    console.warn("Backend not reachable — using sample goals.", err);
  }
}

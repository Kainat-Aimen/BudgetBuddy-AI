// ==========================================================================
// BudgetBuddy AI — Savings Page Logic
// Owner: Member 6 (Savings Goal Tracker)
// Depends on common.js being loaded first (money, goals, GOAL_COLORS)
// ==========================================================================

function renderSummary() {
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);

  document.getElementById("total-saved").textContent = money(totalSaved);
  document.getElementById("total-target").textContent = money(totalTarget);
  document.getElementById("goal-count").textContent = goals.length;
}

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

function renderAll() {
  renderSummary();
  renderGoals();
}

// ---------- Panel toggle ----------
function showPanel(show) {
  document.getElementById("goal-panel").classList.toggle("hidden", !show);
}

document.getElementById("add-goal-trigger").addEventListener("click", () => showPanel(true));
document.getElementById("add-goal-card").addEventListener("click", () => showPanel(true));
document.getElementById("cancel-goal").addEventListener("click", () => showPanel(false));

// ---------- Add Goal ----------
document.getElementById("goal-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("goal-name").value;
  const target = parseFloat(document.getElementById("goal-target").value);
  const deadline = document.getElementById("goal-deadline").value;

  let newGoal = { name, target, saved: 0, deadline };

  // TODO (Member 6): once the backend /goals route accepts a 'name' field,
  // switch this to a real fetch() the same way dashboard.js posts transactions.
  try {
    const res = await fetch(`${API_BASE}/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_amount: target, deadline }),
    });
    const saved = await res.json();
    newGoal = { name, target: saved.target_amount, saved: saved.current_saved || 0, deadline };
  } catch (err) {
    console.warn("Backend not reachable yet — using local fallback.", err);
  }

  goals.push(newGoal);
  e.target.reset();
  showPanel(false);
  renderAll();
});

// ---------- Init ----------
(async function init() {
  await loadGoals();
  renderAll();
})();

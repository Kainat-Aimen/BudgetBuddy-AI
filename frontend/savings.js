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
    card.dataset.id = goal.id;
    card.innerHTML = `
      <div class="goal-ring" style="background: conic-gradient(${color} ${pct * 3.6}deg, #F0E4D4 0deg);">
        <div style="background:#fff; width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
          ${pct}%
        </div>
      </div>
      <div class="goal-name">${goal.name}</div>
      <div class="goal-amounts">${money(goal.saved)} / ${money(goal.target)}</div>
      <div class="goal-actions">
        <button class="icon-btn add-funds" title="Add funds">➕ Add</button>
        <button class="icon-btn delete-goal" title="Delete goal">🗑️</button>
      </div>
    `;
    row.insertBefore(card, addCard);
  });

  row.querySelectorAll(".add-funds").forEach(btn => {
    btn.addEventListener("click", (e) => addFunds(e.target.closest(".goal-card").dataset.id));
  });
  row.querySelectorAll(".delete-goal").forEach(btn => {
    btn.addEventListener("click", (e) => deleteGoal(e.target.closest(".goal-card").dataset.id));
  });
}

function renderAll() {
  renderSummary();
  renderGoals();
}

// ---------- Add funds to an existing goal ----------
async function addFunds(id) {
  const goal = goals.find(g => g.id == id);
  if (!goal) return;
  const amountStr = prompt(`Add how much to "${goal.name}"?`);
  const amount = parseFloat(amountStr);
  if (!amount || amount <= 0) return;

  const newSaved = goal.saved + amount;
  try {
    const res = await fetch(`${API_BASE}/api/goals/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ current_saved: newSaved }),
    });
    const updated = await res.json();
    goal.saved = updated.current_saved;
  } catch (err) {
    console.warn("Backend not reachable — updating locally only.", err);
    goal.saved = newSaved;
  }
  renderAll();
}

// ---------- Delete a goal ----------
async function deleteGoal(id) {
  const goal = goals.find(g => g.id == id);
  if (!goal) return;
  if (!confirm(`Delete goal "${goal.name}"?`)) return;
  try {
    await fetch(`${API_BASE}/api/goals/${id}`, { method: "DELETE", headers: authHeaders() });
  } catch (err) {
    console.warn("Backend not reachable — removing locally only.", err);
  }
  goals = goals.filter(g => g.id != id);
  renderAll();
}

// ---------- Panel toggle ----------
function showPanel(show) {
  document.getElementById("goal-panel").classList.toggle("hidden", !show);
}

document.getElementById("add-goal-trigger").addEventListener("click", () => showPanel(true));
document.getElementById("add-goal-card").addEventListener("click", () => showPanel(true));
document.getElementById("cancel-goal").addEventListener("click", () => showPanel(false));

// ---------- Create Goal ----------
document.getElementById("goal-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("goal-name").value;
  const target = parseFloat(document.getElementById("goal-target").value);
  const startingSaved = parseFloat(document.getElementById("goal-saved").value) || 0;
  const deadline = document.getElementById("goal-deadline").value;

  let newGoal = { id: Date.now(), name, target, saved: startingSaved, deadline };

  try {
    const res = await fetch(`${API_BASE}/api/goals`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name, target_amount: target, current_saved: startingSaved, deadline }),
    });
    const saved = await res.json();
    newGoal = { id: saved.id, name: saved.name, target: saved.target_amount, saved: saved.current_saved || 0, deadline };
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
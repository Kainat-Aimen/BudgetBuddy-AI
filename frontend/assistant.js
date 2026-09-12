// ==========================================================================
// BudgetBuddy AI — Assistant Page Logic
// Owner: Member 5 (Receipt Scanner/OCR) + Member 4 (Chat Advisor)
// Depends on common.js being loaded first (API_BASE)
// ==========================================================================

// ---------- Receipt Scanner (Member 5) ----------
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
    document.getElementById("scanned-transaction-form").classList.remove("hidden");
  } catch (err) {
    console.warn("OCR backend not reachable yet.", err);
    alert("Couldn't reach the receipt scanner yet — the backend may not be running.");
  }
});

// Confirm & save the scanned transaction (posts to the same /transactions route dashboard.js uses)
document.getElementById("scanned-transaction-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("amount").value);
  const description = document.getElementById("description").value;
  const date = document.getElementById("date").value;

  try {
    await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, description, date, source: "ocr_receipt" }),
    });
  } catch (err) {
    console.warn("Backend not reachable — transaction not saved remotely.", err);
  }

  e.target.reset();
  e.target.classList.add("hidden");
  alert("Transaction saved! Check the Dashboard to see it reflected.");
});

// ---------- Chat Advisor (Member 4) ----------
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

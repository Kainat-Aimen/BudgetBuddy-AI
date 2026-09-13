// ==========================================================================
// BudgetBuddy AI — Assistant Page Logic
// Owner: Member 5 (Receipt Scanner/OCR) + Member 4 (Chat Advisor)
// Depends on common.js being loaded first (API_BASE)
// ==========================================================================


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
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.getElementById("chat-input").value = chip.textContent.replace(/^\S+\s/, "");
    sendChat();
  });
});
const API_BASE = "http://127.0.0.1:5000";

const token = localStorage.getItem("budgetbuddy_token");

if (!token) {
  window.location.replace("login.html");
}


const CATEGORY_STYLES = {
  Food: {
    color: "#FB7185",
    icon: "🍔"
  },
  Transport: {
    color: "#38BDF8",
    icon: "🚗"
  },
  Bills: {
    color: "#8B5CF6",
    icon: "💡"
  },
  Shopping: {
    color: "#FBBF24",
    icon: "🛍️"
  },
  Groceries: {
    color: "#34D399",
    icon: "🛒"
  },
  Other: {
    color: "#9CA3AF",
    icon: "💳"
  }
};


const GOAL_COLORS = [
  "#8B5CF6",
  "#38BDF8",
  "#34D399",
  "#FBBF24",
  "#FB7185",
  "#0EA5A5"
];


let transactions = [];
let goals = [];


function money(amount) {
  return `Rs. ${Number(amount).toLocaleString()}`;
}


function categoryStyle(category) {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.Other;
}


function authHeaders() {
  const accessToken = localStorage.getItem(
    "budgetbuddy_token"
  );

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`
  };
}


function redirectToLogin() {
  localStorage.removeItem("budgetbuddy_token");
  localStorage.removeItem("budgetbuddy_user_name");
  window.location.replace("login.html");
}


function showToast(message, type = "success") {
  const previousToast = document.querySelector(".app-toast");

  if (previousToast) {
    previousToast.remove();
  }

  const toast = document.createElement("div");

  toast.className = `app-toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2500);
}


async function loadTransactions() {
  try {
    const response = await fetch(
      `${API_BASE}/api/transactions`,
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
        data.error ||
        data.msg ||
        "Could not load transactions"
      );
    }

    transactions = data.transactions || [];
  } catch (error) {
    console.error("Transactions error:", error);
    transactions = [];
  }
}


async function loadGoals() {
  try {
    const response = await fetch(
      `${API_BASE}/api/goals`,
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
        data.error ||
        data.msg ||
        "Could not load goals"
      );
    }

    goals = (data.goals || []).map(goal => ({
      id: goal.id,
      name: goal.name,
      target: Number(goal.target_amount),
      saved: Number(goal.current_saved),
      deadline: goal.deadline
    }));
  } catch (error) {
    console.error("Goals error:", error);
    goals = [];
  }
}


function renderSidebarUser() {
  const name =
    localStorage.getItem("budgetbuddy_user_name") ||
    "Guest";

  const initial = name.charAt(0).toUpperCase();

  document
    .querySelectorAll(".sidebar-footer .avatar")
    .forEach(element => {
      element.textContent = initial;
    });

  document
    .querySelectorAll(".sidebar-footer .avatar-name")
    .forEach(element => {
      element.textContent = name;
    });
}


async function loadCurrentUser() {
  try {
    const response = await fetch(
      `${API_BASE}/api/auth/me`,
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
        data.error ||
        data.msg ||
        "Could not load user"
      );
    }

    const user = data.user || data;
    const fullName = user.full_name || "User";

    localStorage.setItem(
      "budgetbuddy_user_name",
      fullName
    );

    renderSidebarUser();
  } catch (error) {
    console.error("User profile error:", error);
  }
}


function logout() {
  redirectToLogin();
}


document
  .querySelectorAll(".logout-button")
  .forEach(button => {
    button.addEventListener("click", logout);
  });


renderSidebarUser();
loadCurrentUser();
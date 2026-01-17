"use strict";

/* ==========================
   HELPERS
   ========================== */
function $(id) {
  return document.getElementById(id);
}

function showAlert(element, message, type = "danger") {
  element.className = `alert alert-${type}`;
  element.textContent = message;
  element.classList.remove("d-none");
}

function formatDateTime(date = new Date()) {
  return date.toLocaleString("es", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ==========================
   SESSION
   ========================== */
function isLoginPage() {
  // En tu login.html existe este form
  return Boolean($("loginForm"));
}

function isLoggedIn() {
  return localStorage.getItem("isLogged") === "true";
}

function logout() {
  localStorage.removeItem("isLogged");
  localStorage.removeItem("userEmail");
  // No borro balance para que siga existiendo la wallet; si quieres, lo borramos después
  window.location.href = "./login.html";
}

function protectPrivatePages() {
  // Si NO estoy en login y NO hay sesión, vuelvo a login
  if (!isLoginPage() && !isLoggedIn()) {
    window.location.href = "./login.html";
  }
}

/* ==========================
   WALLET DATA (saldo base)
   ========================== */
function getBalance() {
  const raw = localStorage.getItem("balance");
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function setBalance(value) {
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? numeric : 0;
  localStorage.setItem("balance", String(safe));
  localStorage.setItem("lastUpdate", formatDateTime());
}

function getLastUpdate() {
  return localStorage.getItem("lastUpdate") || "—";
}

/* ==========================
   LOGIN
   ========================== */
function initLogin() {
  const form = $("loginForm");
  const alertBox = $("loginAlert");
  if (!form || !alertBox) return;

  // Si ya hay sesión, manda al menú
  if (isLoggedIn()) {
    window.location.href = "./menu.html";
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      showAlert(alertBox, "Revisa los campos e intenta nuevamente.", "warning");
      return;
    }

    const email = $("email").value.trim();
    const password = $("password").value;

    const DEMO_USER = { email: "demo@alkewallet.com", password: "1234" };

    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      localStorage.setItem("isLogged", "true");
      localStorage.setItem("userEmail", email);

      // Inicializar balance si no existe
      if (localStorage.getItem("balance") === null) {
        setBalance(0);
      } else if (!localStorage.getItem("lastUpdate")) {
        localStorage.setItem("lastUpdate", formatDateTime());
      }

      showAlert(alertBox, "¡Login exitoso! Redirigiendo...", "success");
      setTimeout(() => (window.location.href = "./menu.html"), 600);
    } else {
      showAlert(
        alertBox,
        "Credenciales incorrectas. Usa demo@alkewallet.com / 1234",
        "danger"
      );
    }

    form.classList.add("was-validated");
  });
}

/* ==========================
   MENU
   ========================== */
function initMenu() {
  const userEmailEl = $("userEmail");
  const balanceEl = $("balanceAmount");
  const lastUpdateEl = $("lastUpdate");
  const logoutBtn = $("btnLogout");

  // Si no están, no es la página menú
  if (!userEmailEl || !balanceEl || !lastUpdateEl || !logoutBtn) return;

  // Render de datos
  userEmailEl.textContent = localStorage.getItem("userEmail") || "usuario";
  balanceEl.textContent = getBalance().toLocaleString("es");
  lastUpdateEl.textContent = getLastUpdate();

  // Logout (más robusto)
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}

/* ==========================
   ENTRY POINT
   ========================== */
document.addEventListener("DOMContentLoaded", () => {
  // 1) Proteger páginas privadas primero
  protectPrivatePages();

  // 2) Inicializar según la página
  initLogin();
  initMenu();
});

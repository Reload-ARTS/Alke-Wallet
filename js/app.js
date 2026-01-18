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

function formatMoney(amount) {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toLocaleString("es");
}

/* ==========================
   SESSION
   ========================== */
function isLoginPage() {
  return Boolean($("loginForm"));
}

function isLoggedIn() {
  return localStorage.getItem("isLogged") === "true";
}

function logout() {
  localStorage.removeItem("isLogged");
  localStorage.removeItem("userEmail");
  window.location.href = "./login.html";
}

function protectPrivatePages() {
  if (!isLoginPage() && !isLoggedIn()) {
    window.location.href = "./login.html";
  }
}

/* ==========================
   WALLET DATA
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
   TRANSACTIONS
   ========================== */
function getTransactions() {
  try {
    const raw = localStorage.getItem("transactions");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTransactions(list) {
  localStorage.setItem("transactions", JSON.stringify(list));
}

function addTransaction(tx) {
  const list = getTransactions();
  list.unshift(tx); // newest first
  saveTransactions(list);
}

function renderLastTransactions(containerEl, limit = 3) {
  const list = getTransactions().slice(0, limit);

  if (!list.length) return;

  containerEl.innerHTML = "";

  list.forEach((tx) => {
    const isDeposit = tx.type === "deposit";
    const sign = isDeposit ? "+" : "-";

    const row = document.createElement("div");
    row.className =
      "d-flex justify-content-between align-items-center p-3 glass-row";

    row.innerHTML = `
      <div>
        <div class="fw-semibold">${tx.title || "Movimiento"}</div>
        <div class="text-xs-glass">${tx.date || ""}${
          tx.note ? ` • ${tx.note}` : ""
        }</div>
      </div>
      <div class="${isDeposit ? "tx-positive" : "tx-negative"} fw-semibold">
        ${sign}$${formatMoney(tx.amount)}
      </div>
    `;

    containerEl.appendChild(row);
  });
}

function clearTransactions() {
  localStorage.removeItem("transactions");
}

function renderTransactions(listEl, emptyEl, filter = "all") {
  const all = getTransactions();
  const filtered =
    filter === "all" ? all : all.filter((tx) => tx.type === filter);

  listEl.innerHTML = "";

  if (!filtered.length) {
    emptyEl.classList.remove("d-none");
    return;
  }

  emptyEl.classList.add("d-none");

  filtered.forEach((tx) => {
    const isPositive = tx.type === "deposit";
    const sign = isPositive ? "+" : "-";

    const row = document.createElement("div");
    row.className =
      "d-flex justify-content-between align-items-start align-items-md-center p-3 glass-row";

    row.innerHTML = `
      <div class="me-3">
        <div class="fw-semibold">${tx.title || "Movimiento"}</div>
        <div class="text-xs-glass">${tx.date || ""}</div>
        ${
          tx.note
            ? `<div class="text-xs-glass tx-note">📝 ${tx.note}</div>`
            : ""
        }
      </div>

      <div class="text-end">
        <div class="${isPositive ? "tx-positive" : "tx-negative"} fw-semibold">
          ${sign}$${formatMoney(tx.amount)}
        </div>
        <div class="text-xs-glass">${tx.type === "deposit" ? "Depósito" : "Envío"}</div>
      </div>
    `;

    listEl.appendChild(row);
  });
}

function initTransactions() {
  const listEl = $("txList");
  const emptyEl = $("txEmpty");
  const alertBox = $("txAlert");

  const currentBalanceEl = $("currentBalance");
  const lastUpdateEl = $("lastUpdate");

  const logoutBtn = $("btnLogout");
  const clearBtn = $("btnClearTx");

  // Detectar si estamos en transactions.html
  if (
    !listEl ||
    !emptyEl ||
    !alertBox ||
    !currentBalanceEl ||
    !lastUpdateEl ||
    !logoutBtn ||
    !clearBtn
  ) {
    return;
  }

  // Render header
  currentBalanceEl.textContent = getBalance().toLocaleString("es");
  lastUpdateEl.textContent = getLastUpdate();

  // Logout
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  // Filtros
  let activeFilter = "all";
  const filterButtons = document.querySelectorAll("[data-filter]");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.getAttribute("data-filter") || "all";

      // UI: marcar activo
      filterButtons.forEach((b) => b.classList.remove("btn-glass-active"));
      btn.classList.add("btn-glass-active");

      renderTransactions(listEl, emptyEl, activeFilter);
    });
  });

  // Set activo por defecto
  const defaultBtn = document.querySelector('[data-filter="all"]');
  if (defaultBtn) defaultBtn.classList.add("btn-glass-active");

  // Limpiar historial
  clearBtn.addEventListener("click", () => {
    clearTransactions();
    renderTransactions(listEl, emptyEl, activeFilter);
    showAlert(alertBox, "Historial eliminado (solo en este navegador).", "warning");
  });

  // Render inicial
  renderTransactions(listEl, emptyEl, activeFilter);
}


/* ==========================
   LOGIN
   ========================== */
function initLogin() {
  const form = $("loginForm");
  const alertBox = $("loginAlert");
  if (!form || !alertBox) return;

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
  const lastTransactionsEl = $("lastTransactions");

  if (!userEmailEl || !balanceEl || !lastUpdateEl || !logoutBtn) return;

  userEmailEl.textContent = localStorage.getItem("userEmail") || "usuario";
  balanceEl.textContent = getBalance().toLocaleString("es");
  lastUpdateEl.textContent = getLastUpdate();

  if (lastTransactionsEl) {
    renderLastTransactions(lastTransactionsEl, 3);
  }

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}

/* ==========================
   DEPOSIT
   ========================== */
function initDeposit() {
  const form = $("depositForm");
  const alertBox = $("depositAlert");
  const amountInput = $("depositAmount");
  const noteInput = $("depositNote");

  const currentBalanceEl = $("currentBalance");
  const lastUpdateEl = $("lastUpdate");
  const logoutBtn = $("btnLogout");

  if (
    !form ||
    !alertBox ||
    !amountInput ||
    !currentBalanceEl ||
    !lastUpdateEl ||
    !logoutBtn
  )
    return;

  currentBalanceEl.textContent = getBalance().toLocaleString("es");
  lastUpdateEl.textContent = getLastUpdate();

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      showAlert(alertBox, "Ingresa un monto válido para continuar.", "warning");
      return;
    }

    const amount = Number(amountInput.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      form.classList.add("was-validated");
      showAlert(alertBox, "El monto debe ser mayor a 0.", "warning");
      return;
    }

    const newBalance = getBalance() + amount;
    setBalance(newBalance);

    addTransaction({
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      type: "deposit",
      title: "Depósito",
      amount: amount,
      note: (noteInput?.value || "").trim(),
      date: formatDateTime(),
    });

    currentBalanceEl.textContent = getBalance().toLocaleString("es");
    lastUpdateEl.textContent = getLastUpdate();

    form.reset();
    form.classList.remove("was-validated");

    showAlert(alertBox, "Depósito realizado correctamente.", "success");
  });
}

function initSendMoney() {
  const form = $("sendForm");
  const alertBox = $("sendAlert");
  const recipientInput = $("recipient");
  const amountInput = $("sendAmount");
  const noteInput = $("sendNote");

  const currentBalanceEl = $("currentBalance");
  const lastUpdateEl = $("lastUpdate");
  const logoutBtn = $("btnLogout");

  // Detectar si estamos en sendmoney.html
  if (
    !form ||
    !alertBox ||
    !recipientInput ||
    !amountInput ||
    !currentBalanceEl ||
    !lastUpdateEl ||
    !logoutBtn
  ) {
    return;
  }

  recipientInput.addEventListener("input", () => {
  recipientInput.value = recipientInput.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
  recipientInput.setCustomValidity("");
});

  // Render inicial
  currentBalanceEl.textContent = getBalance().toLocaleString("es");
  lastUpdateEl.textContent = getLastUpdate();

  // Logout
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      showAlert(alertBox, "Revisa los campos e intenta nuevamente.", "warning");
      return;
    }

    const recipient = recipientInput.value.trim();
    const amount = Number(amountInput.value);
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (!recipient) {
      recipient.setCustomValidity("required");
      form.classList.add("was-validated");
      showAlert(alertBox, "Debes ingresar un destinatario.", "warning");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      form.classList.add("was-validated");
      showAlert(alertBox, "El monto debe ser mayor a 0.", "warning");
      return;
    }

    if(!nameRegex.test(recipient)) {
      form.classList.add("was-validated");
      showAlert(
        alertBox,
        "El nombre del destinatario solo puede contener letras y espacios.",
        "warning"
      );
      return;
    }

    const balance = getBalance();
    if (amount > balance) {
      form.classList.add("was-validated");
      showAlert(alertBox, "Saldo insuficiente para realizar este envío.", "danger");
      return;
    }

    // Actualizar saldo (restar)
    const newBalance = balance - amount;
    setBalance(newBalance);

    // Guardar transacción (tipo envío)
    addTransaction({
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      type: "send",
      title: `Envío a ${recipient}`,
      amount: amount,
      note: (noteInput?.value || "").trim(),
      date: formatDateTime(),
    });

    // Render actualizado
    currentBalanceEl.textContent = getBalance().toLocaleString("es");
    lastUpdateEl.textContent = getLastUpdate();

    // Reset form
    form.reset();
    form.classList.remove("was-validated");

    showAlert(alertBox, "Envío realizado correctamente.", "success");
  });
}

/* ==========================
   ENTRY POINT
   ========================== */
document.addEventListener("DOMContentLoaded", () => {
  protectPrivatePages();
  initLogin();
  initMenu();
  initDeposit();
  initSendMoney();
  initTransactions();
});

"use strict";

/* ==========================
   HELPERS
   Funciones reutilizables para DOM, alertas y formateo
   ========================== */

/**
 * Selector simple por id.
 * Útil para acortar document.getElementById(...)
 */
function $(id) {
  return document.getElementById(id);
}

/**
 * Muestra una alerta Bootstrap dentro de un contenedor.
 * Lógica UI: centraliza mensajes (tipo + texto) para todo el proyecto.
 */
function showAlert(element, message, type = "danger") {
  element.className = `alert alert-${type}`;
  element.textContent = message;
  element.classList.remove("d-none");
}

/**
 * Formatea fecha/hora para mostrar en la interfaz ("Última actualización", etc.)
 */
function formatDateTime(date = new Date()) {
  return date.toLocaleString("es", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formatea montos de dinero de forma segura.
 * Si el valor no es válido, devuelve "0".
 */
function formatMoney(amount) {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toLocaleString("es");
}

/* ==========================
   SESSION
   Manejo de login "demo" con localStorage
   ========================== */

/**
 * Detecta si estamos en login.html buscando el formulario.
 * Esto permite usar el mismo app.js en varias páginas.
 */
function isLoginPage() {
  return Boolean($("loginForm"));
}

/**
 * Estado de sesión guardado en localStorage (modo demo).
 */
function isLoggedIn() {
  return localStorage.getItem("isLogged") === "true";
}

/**
 * Cierra sesión limpiando la sesión y redirigiendo a login.
 */
function logout() {
  localStorage.removeItem("isLogged");
  localStorage.removeItem("userEmail");
  window.location.href = "./login.html";
}

/**
 * Protege páginas privadas:
 * - Si NO es login.html
 * - y NO hay sesión
 * => redirige a login.html
 */
function protectPrivatePages() {
  if (!isLoginPage() && !isLoggedIn()) {
    window.location.href = "./login.html";
  }
}

/* ==========================
   WALLET DATA
   Estado principal: balance + timestamp
   ========================== */

/**
 * Lee el balance desde localStorage con fallback seguro.
 */
function getBalance() {
  const raw = localStorage.getItem("balance");
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Guarda el balance y actualiza la última fecha de cambio.
 * Lógica de negocio: cualquier cambio de saldo actualiza "lastUpdate".
 */
function setBalance(value) {
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? numeric : 0;
  localStorage.setItem("balance", String(safe));
  localStorage.setItem("lastUpdate", formatDateTime());
}

/**
 * Devuelve la última actualización o un placeholder.
 */
function getLastUpdate() {
  return localStorage.getItem("lastUpdate") || "—";
}

/* ==========================
   TRANSACTIONS
   CRUD simple de transacciones en localStorage
   ========================== */

/**
 * Obtiene el arreglo de transacciones.
 * Lógica defensiva: si el JSON está corrupto, devuelve [].
 */
function getTransactions() {
  try {
    const raw = localStorage.getItem("transactions");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persiste la lista completa de transacciones.
 */
function saveTransactions(list) {
  localStorage.setItem("transactions", JSON.stringify(list));
}

/**
 * Inserta una transacción al inicio (newest first) y guarda.
 */
function addTransaction(tx) {
  const list = getTransactions();
  list.unshift(tx); // newest first
  saveTransactions(list);
}

/**
 * Render compacto para menu.html (sección "Últimos movimientos").
 * Nota: usa innerHTML. En producción convendría textContent/creación de nodos.
 */
function renderLastTransactions(containerEl, limit = 3) {
  const list = getTransactions().slice(0, limit);

  // Si no hay transacciones, no se muestra nada (la UI puede tener placeholder)
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

/**
 * Limpia historial de transacciones del navegador actual.
 */
function clearTransactions() {
  localStorage.removeItem("transactions");
}

/**
 * Render completo para transactions.html con filtros.
 * filter: "all" | "deposit" | "send"
 */
function renderTransactions(listEl, emptyEl, filter = "all") {
  const all = getTransactions();
  const filtered =
    filter === "all" ? all : all.filter((tx) => tx.type === filter);

  listEl.innerHTML = "";

  // Estado vacío: muestra el mensaje placeholder
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
        <div class="text-xs-glass">${
          tx.type === "deposit" ? "Depósito" : "Envío"
        }</div>
      </div>
    `;

    listEl.appendChild(row);
  });
}

/**
 * Inicializa transactions.html:
 * - Header (saldo + última actualización)
 * - Logout
 * - Filtros (data-filter)
 * - Limpieza de historial
 */
function initTransactions() {
  const listEl = $("txList");
  const emptyEl = $("txEmpty");
  const alertBox = $("txAlert");

  const currentBalanceEl = $("currentBalance");
  const lastUpdateEl = $("lastUpdate");

  const logoutBtn = $("btnLogout");
  const clearBtn = $("btnClearTx");

  // Guard clause: si no estamos en transactions.html, salimos
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

  // Header inicial
  currentBalanceEl.textContent = getBalance().toLocaleString("es");
  lastUpdateEl.textContent = getLastUpdate();

  // Logout
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  // Filtros (estado de UI local)
  let activeFilter = "all";
  const filterButtons = document.querySelectorAll("[data-filter]");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.getAttribute("data-filter") || "all";

      // UI: marcar botón activo
      filterButtons.forEach((b) => b.classList.remove("btn-glass-active"));
      btn.classList.add("btn-glass-active");

      renderTransactions(listEl, emptyEl, activeFilter);
    });
  });

  // Botón activo por defecto
  const defaultBtn = document.querySelector('[data-filter="all"]');
  if (defaultBtn) defaultBtn.classList.add("btn-glass-active");

  // Limpiar historial
  clearBtn.addEventListener("click", () => {
    clearTransactions();
    renderTransactions(listEl, emptyEl, activeFilter);
    showAlert(
      alertBox,
      "Historial eliminado (solo en este navegador).",
      "warning"
    );
  });

  // Render inicial
  renderTransactions(listEl, emptyEl, activeFilter);
}

/* ==========================
   LOGIN
   ========================== */

/**
 * Credenciales demo (modo práctica).
 * En producción esto vendría desde backend.
 */
const DEMO_USER = { email: "demo@alkewallet.com", password: "1234" };

/**
 * Inicializa login.html:
 * - valida formulario
 * - guarda sesión en localStorage
 * - inicializa balance/lastUpdate si es primera vez
 */
function initLogin() {
  const form = $("loginForm");
  const alertBox = $("loginAlert");
  if (!form || !alertBox) return;

  // Si ya está logueado, no mostrar login y redirigir al menú
  if (isLoggedIn()) {
    window.location.href = "./menu.html";
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    // Validación nativa HTML + UI Bootstrap
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      showAlert(alertBox, "Revisa los campos e intenta nuevamente.", "warning");
      return;
    }

    const email = $("email").value.trim();
    const password = $("password").value;

    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      // Guardar sesión (demo)
      localStorage.setItem("isLogged", "true");
      localStorage.setItem("userEmail", email);

      // Inicialización de datos si es primera vez
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

/**
 * Inicializa menu.html:
 * - muestra email, saldo y última actualización
 * - muestra últimos movimientos
 * - permite cerrar sesión
 */
function initMenu() {
  const userEmailEl = $("userEmail");
  const balanceEl = $("balanceAmount");
  const lastUpdateEl = $("lastUpdate");
  const logoutBtn = $("btnLogout");
  const lastTransactionsEl = $("lastTransactions");

  // Guard clause: si no estamos en menu.html, salimos
  if (!userEmailEl || !balanceEl || !lastUpdateEl || !logoutBtn) return;

  userEmailEl.textContent = localStorage.getItem("userEmail") || "usuario";
  balanceEl.textContent = getBalance().toLocaleString("es");
  lastUpdateEl.textContent = getLastUpdate();

  // Render de "Últimos movimientos"
  if (lastTransactionsEl) {
    renderLastTransactions(lastTransactionsEl, 3);
  }

  // Logout
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}

/* ==========================
   DEPOSIT
   ========================== */

/**
 * Inicializa deposit.html:
 * - valida monto
 * - suma saldo
 * - registra transacción tipo "deposit"
 */
function initDeposit() {
  const form = $("depositForm");
  const alertBox = $("depositAlert");
  const amountInput = $("depositAmount");
  const noteInput = $("depositNote");

  const currentBalanceEl = $("currentBalance");
  const lastUpdateEl = $("lastUpdate");
  const logoutBtn = $("btnLogout");

  // Guard clause: si no estamos en deposit.html, salimos
  if (
    !form ||
    !alertBox ||
    !amountInput ||
    !currentBalanceEl ||
    !lastUpdateEl ||
    !logoutBtn
  ) {
    return;
  }

  // Header inicial
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
      showAlert(alertBox, "Ingresa un monto válido para continuar.", "warning");
      return;
    }

    // Validación de negocio: monto > 0
    const amount = Number(amountInput.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      form.classList.add("was-validated");
      showAlert(alertBox, "El monto debe ser mayor a 0.", "warning");
      return;
    }

    // Actualizar saldo (+)
    const newBalance = getBalance() + amount;
    setBalance(newBalance);

    // Registrar transacción
    addTransaction({
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      type: "deposit",
      title: "Depósito",
      amount: amount,
      note: (noteInput?.value || "").trim(),
      date: formatDateTime(),
    });

    // Render actualizado
    currentBalanceEl.textContent = getBalance().toLocaleString("es");
    lastUpdateEl.textContent = getLastUpdate();

    // Reset UI
    form.reset();
    form.classList.remove("was-validated");

    showAlert(alertBox, "Depósito realizado correctamente.", "success");
  });
}

/* ==========================
   SEND MONEY
   ========================== */

/**
 * Inicializa sendmoney.html:
 * - valida destinatario y monto
 * - valida saldo disponible
 * - resta saldo
 * - registra transacción tipo "send"
 */
function initSendMoney() {
  const form = $("sendForm");
  const alertBox = $("sendAlert");
  const recipientInput = $("recipient");
  const amountInput = $("sendAmount");
  const noteInput = $("sendNote");

  const currentBalanceEl = $("currentBalance");
  const lastUpdateEl = $("lastUpdate");
  const logoutBtn = $("btnLogout");

  // Guard clause: si no estamos en sendmoney.html, salimos
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

  // Sanitiza destinatario en tiempo real (solo letras y espacios)
  recipientInput.addEventListener("input", () => {
    recipientInput.value = recipientInput.value.replace(
      /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
      ""
    );
    // Limpia error personalizado al volver a escribir
    recipientInput.setCustomValidity("");
  });

  // Header inicial
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

    // Validación de negocio: destinatario requerido
    if (!recipient) {
      // FIX: setCustomValidity debe ir sobre el input, no sobre el string
      recipientInput.setCustomValidity("Debes ingresar un destinatario.");
      form.classList.add("was-validated");
      showAlert(alertBox, "Debes ingresar un destinatario.", "warning");
      return;
    }

    // Validación de negocio: monto > 0
    if (!Number.isFinite(amount) || amount <= 0) {
      form.classList.add("was-validated");
      showAlert(alertBox, "El monto debe ser mayor a 0.", "warning");
      return;
    }

    // Validación de negocio: nombre solo letras/espacios
    if (!nameRegex.test(recipient)) {
      form.classList.add("was-validated");
      showAlert(
        alertBox,
        "El nombre del destinatario solo puede contener letras y espacios.",
        "warning"
      );
      return;
    }

    // Validación de negocio: saldo suficiente
    const balance = getBalance();
    if (amount > balance) {
      form.classList.add("was-validated");
      showAlert(alertBox, "Saldo insuficiente para realizar este envío.", "danger");
      return;
    }

    // Actualizar saldo (-)
    const newBalance = balance - amount;
    setBalance(newBalance);

    // Registrar transacción
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

    // Reset UI
    form.reset();
    form.classList.remove("was-validated");

    showAlert(alertBox, "Envío realizado correctamente.", "success");
  });
}

/* ==========================
   ENTRY POINT
   Se ejecuta cuando el DOM está listo:
   - Protege rutas
   - Inicializa la lógica de la página actual
   ========================== */
document.addEventListener("DOMContentLoaded", () => {
  protectPrivatePages();
  initLogin();
  initMenu();
  initDeposit();
  initSendMoney();
  initTransactions();
});

"use strict";

/**
 * Utilidad: mostrar alertas en pantalla
 */
function showAlert(element, message, type = "danger") {
  element.className = `alert alert-${type}`;
  element.textContent = message;
  element.classList.remove("d-none");
}

/**
 * Inicializa el Login si estamos en login.html
 */
function initLogin() {
  const form = document.getElementById("loginForm");
  const alertBox = document.getElementById("loginAlert");

  if (!form || !alertBox) return; // No estamos en login

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    // Validación HTML5 + Bootstrap
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      showAlert(alertBox, "Revisa los campos e intenta nuevamente.", "warning");
      return;
    }

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Credenciales demo asignadas (puedes cambiarlas)
    const DEMO_USER = { email: "demo@alkewallet.com", password: "1234" };

    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      localStorage.setItem("isLogged", "true");
      localStorage.setItem("userEmail", email);

      showAlert(alertBox, "¡Login exitoso! Redirigiendo...", "success");

      setTimeout(() => {
        window.location.href = "./menu.html";
      }, 600);
    } else {
      showAlert(alertBox, "Credenciales incorrectas. Usa demo@alkewallet.com / 1234", "danger");
    }

    form.classList.add("was-validated");
  });
}

/**
 * Punto de entrada general
 * (aquí iremos agregando initMenu(), initDeposit(), etc.)
 */
document.addEventListener("DOMContentLoaded", () => {
  initLogin();
});

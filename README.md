# 💳 Alke Wallet
**Fundamentos del Desarrollo Frontend**

Este proyecto corresponde al **Trabajo Práctico del Módulo 2**, cuyo objetivo es desarrollar una aplicación web frontend que simule el funcionamiento básico de una billetera digital (*wallet*), aplicando HTML, CSS, JavaScript y Bootstrap.

La aplicación permite gestionar una sesión simulada, administrar un saldo, realizar depósitos y envíos de dinero, y visualizar un historial de transacciones.

---

## 🚀 Funcionalidades

### 🔐 Autenticación (simulada)
- Inicio de sesión con credenciales de prueba
- Protección de rutas mediante validación de sesión
- Cierre de sesión

### 💰 Gestión de saldo
- Visualización del saldo disponible
- Depósito de fondos
- Envío de dinero con validaciones
- Control de saldo insuficiente

### 📊 Transacciones
- Registro de todas las operaciones
- Visualización de últimos movimientos en el menú principal
- Historial completo de transacciones
- Filtros por tipo: **Todos / Depósitos / Envíos**
- Opción para limpiar historial (local)

### 🧠 Persistencia
- Uso de `localStorage` para mantener:
  - Sesión
  - Saldo
  - Historial de transacciones

---

## 🖥️ Vistas del proyecto

- `login.html` → Inicio de sesión
- `menu.html` → Dashboard y saldo
- `deposit.html` → Depósito de fondos
- `sendmoney.html` → Envío de dinero
- `transactions.html` → Historial completo

---

## 🛠️ Tecnologías utilizadas

- **HTML5** (estructura semántica)
- **CSS3** (estilos personalizados + glassmorphism)
- **JavaScript (Vanilla JS)**  
- **Bootstrap 5** (diseño responsive)
- **Git & GitHub** (control de versiones)

---

## 📂 Estructura del proyecto

```text
ProyectoModulo2/
├── assets/
│   └── img/
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── pages/
│   ├── login.html
│   ├── menu.html
│   ├── deposit.html
│   ├── sendmoney.html
│   └── transactions.html
└── README.md
```
---

## ▶️ Cómo ejecutar el proyecto

1. Clonar el repositorio: git clone <URL_DEL_REPOSITORIO>
2. Abrir el proyecto en Visual Studio Code
3. Ejecutar con Live Server
4. Abrir pages/login.html
5. Click derecho → Open with Live Server

---

## 🔑 Credenciales de prueba

- Email: demo@alkewallet.com
- Password: 1234

---

## 📌 Notas

- La aplicación es 100% frontend, sin backend ni base de datos real.
- Todos los datos se almacenan localmente en el navegador.
- Proyecto desarrollado con fines académicos.

---

## 👤 Autor

- Antonio Toro Sagredo
- Desarrollo de Aplicaciones Full Stack JavaScript Trainee
- Módulo 2 – Fundamentos del Desarrollo Frontend

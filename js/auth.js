/* ============================================================
   JL NewReleases — auth.js
   Autenticación simulada (reemplazar por backend real / Firebase Auth)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  const errorBox = document.getElementById("login-error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      errorBox.textContent = "Completa correo y contraseña.";
      errorBox.style.display = "block";
      return;
    }

    // TODO: reemplazar por autenticación real (ej. Firebase Auth)
    localStorage.setItem("jl_user", JSON.stringify({ email }));
    window.location.href = "perfil.html";
  });
});

function logout() {
  localStorage.removeItem("jl_user");
  window.location.href = "login.html";
}

function currentUser() {
  return JSON.parse(localStorage.getItem("jl_user") || "null");
}

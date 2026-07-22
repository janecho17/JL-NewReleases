import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  const errorBox = document.getElementById("login-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "perfil.html";
    } catch (error) {
      errorBox.style.display = "block";
      errorBox.textContent = "Correo o contraseña incorrectos.";
    }
  });
});

export async function logout() {
  await signOut(auth);
  window.location.href = "login.html";
}

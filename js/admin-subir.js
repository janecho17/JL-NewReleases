import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const estado = document.getElementById("estado");

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      alert("No existe información del usuario.");
      window.location.href = "../index.html";
      return;
    }

    const datos = docSnap.data();

    if (datos.role !== "admin") {
      alert("No tienes permiso para entrar.");
      window.location.href = "../index.html";
      return;
    }

    console.log("Administrador autorizado");

  } catch (error) {
    console.error(error);
    alert("Error al verificar permisos.");
    window.location.href = "../index.html";
  }

});

async function subirArchivo(file) {

  const formData = new FormData();

  formData.append("file", file);

  const respuesta = await fetch(
    "https://jlnewreleases-upload.jacnerlopez2020.workers.dev/upload",
    {
      method: "POST",
      body: formData
    }
  );

  if (!respuesta.ok) {
    throw new Error("No se pudo subir el archivo.");
  }

  const datos = await respuesta.json();

  return datos.url;
}

const form = document.getElementById("subir-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;
    const categoria = document.getElementById("categoria").value;
    const portada = document.getElementById("portada").files[0];
    const video = document.getElementById("video").files[0];
    const submitBtn = form.querySelector("button[type=submit]");

    submitBtn.disabled = true;

    try {
      estado.style.color = "";

      estado.textContent = "Subiendo portada...";

      const portadaURL = await subirArchivo(portada);

      estado.textContent = "Subiendo video...";

      const videoURL = await subirArchivo(video);

      estado.textContent = "Guardando en el catálogo…";

      await addDoc(collection(db, "peliculas"), {
        titulo,
        descripcion,
        categoria,
        portada: portadaURL,
        video: videoURL,
        fecha: serverTimestamp()
      });

      estado.style.color = "var(--accent-green)";
      estado.textContent = "✔ Película subida correctamente.";
      form.reset();

    } catch (err) {
      console.error(err);
      estado.style.color = "var(--accent-red)";
      estado.textContent = "✖ Error al subir: " + err.message;

    } finally {
      submitBtn.disabled = false;
    }
  });
}

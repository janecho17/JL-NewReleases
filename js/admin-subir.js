import { storage, db, auth } from "./firebase.js";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

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

function subirArchivo(path, file, onProgress) {
  return new Promise((resolve, reject) => {
    const fileRef = ref(storage, path);
    const task = uploadBytesResumable(fileRef, file);
    task.on(
      "state_changed",
      (snap) => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => resolve(await getDownloadURL(task.snapshot.ref))
    );
  });
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
      estado.textContent = "Subiendo portada…";
      const portadaURL = await subirArchivo(
        "portadas/" + Date.now() + "_" + portada.name,
        portada,
        (pct) => (estado.textContent = `Subiendo portada… ${pct}%`)
      );

      // Los videos grandes (varios GB) pueden tardar bastante según tu
      // conexión de subida; no cierres esta pestaña mientras avanza.
      const videoURL = await subirArchivo(
        "videos/" + Date.now() + "_" + video.name,
        video,
        (pct) => (estado.textContent = `Subiendo video… ${pct}% (no cierres esta pestaña)`)
      );

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

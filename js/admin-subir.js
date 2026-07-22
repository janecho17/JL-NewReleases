import { storage, db } from "./firebase.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  if (user.email !== "jacnerlopez2020@gmail.com") {
    alert("No tienes permiso para entrar.");
    window.location.href = "../index.html";
    return;
  }

});
const form = document.getElementById("subir-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;
    const categoria = document.getElementById("categoria").value;
    const portada = document.getElementById("portada").files[0];
    const video = document.getElementById("video").files[0];

    try {

      // Subir portada
      const portadaRef = ref(storage, "portadas/" + Date.now() + "_" + portada.name);
      await uploadBytes(portadaRef, portada);
      const portadaURL = await getDownloadURL(portadaRef);

      // Subir video
      const videoRef = ref(storage, "videos/" + Date.now() + "_" + video.name);
      await uploadBytes(videoRef, video);
      const videoURL = await getDownloadURL(videoRef);

      // Guardar en Firestore
      await addDoc(collection(db, "peliculas"), {
        titulo,
        descripcion,
        categoria,
        portada: portadaURL,
        video: videoURL,
        fecha: serverTimestamp()
      });

      alert("Película subida correctamente");

      form.reset();

    } catch (err) {
      console.error(err);
      alert("Error al subir.");
    }
  });
}

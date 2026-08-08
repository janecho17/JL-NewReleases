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

async function subirArchivo(file, onProgress) {

  const WORKER_URL =
    "https://jlnewreleases-upload.jacnerlopez2020.workers.dev";

  const CHUNK_SIZE = 50 * 1024 * 1024; // 50 MB

  // ==============================
  // 1. INICIAR SUBIDA
  // ==============================

  const startResponse = await fetch(
    `${WORKER_URL}/upload/start`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type
      })
    }
  );
  console.log("START RESPONSE:", startResponse.status);

  if (!startResponse.ok) {
    throw new Error("No se pudo iniciar la subida.");
  }

  const startData = await startResponse.json();

  const {
    key,
    uploadId
  } = startData;

  // ==============================
  // 2. SUBIR PARTES
  // ==============================

  const parts = [];

  const totalParts =
    Math.ceil(file.size / CHUNK_SIZE);

  for (
    let partNumber = 1;
    partNumber <= totalParts;
    partNumber++
  ) {

    const start =
      (partNumber - 1) * CHUNK_SIZE;

    const end =
      Math.min(
        start + CHUNK_SIZE,
        file.size
      );

    const chunk =
      file.slice(start, end);

    let partData;
let ultimoError;

for (let intento = 1; intento <= 5; intento++) {
  try {
    const formData = new FormData();

    formData.append(
      "key",
      key
    );

    formData.append(
      "uploadId",
      uploadId
    );

    formData.append(
      "partNumber",
      String(partNumber)
    );

    formData.append(
      "file",
      chunk,
      file.name
    );

    const partResponse = await fetch(
      `${WORKER_URL}/upload/part`,
      {
        method: "POST",
        body: formData
      }
    );

    if (!partResponse.ok) {
      const errorText = await partResponse.text();

      throw new Error(
        `HTTP ${partResponse.status}: ${errorText}`
      );
    }

    partData = await partResponse.json();

    if (!partData.success || !partData.etag) {
      throw new Error(
        "Cloudflare no devolvió un ETag válido."
      );
    }

    // La parte se subió correctamente
    break;

  } catch (error) {
    ultimoError = error;

    console.warn(
      `Parte ${partNumber}: intento ${intento}/5`,
      error
    );

    if (intento < 5) {
      const espera = 2000 * Math.pow(2, intento - 1);

      await new Promise(resolve =>
        setTimeout(resolve, espera)
      );
    }
  }
}

if (!partData) {
  throw new Error(
    `No se pudo subir la parte ${partNumber} después de 5 intentos: ${ultimoError?.message || "Error desconocido"}`
  );
}

    parts.push({
      partNumber,
      etag: partData.etag
    });

    const porcentaje =
      Math.round(
        (end / file.size) * 100
      );

    if (onProgress) {
      onProgress(porcentaje);
    }
  }

  // ==============================
  // 3. COMPLETAR EN R2
  // ==============================

  const completeResponse =
    await fetch(
      `${WORKER_URL}/upload/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          key,
          uploadId,
          parts
        })
      }
    );

  if (!completeResponse.ok) {
    throw new Error(
      "No se pudo completar la subida en R2."
    );
  }

  const completeData =
    await completeResponse.json();

  if (!completeData.url) {
    throw new Error(
      "R2 no devolvió la URL del archivo."
    );
  }

  if (onProgress) {
    onProgress(100);
  }

  return completeData.url;
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

      const portadaURL = await subirArchivo(
  portada,
  (pct) => {
    estado.textContent = `Subiendo portada... ${pct}%`;
  }
);

      const videoURL = await subirArchivo(
  video,
  (pct) => {
    estado.textContent = `Subiendo video... ${pct}%`;
  }
);

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

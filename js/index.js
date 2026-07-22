import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const contenedor = document.getElementById("peliculas");

async function cargarPeliculas() {
  const q = query(
    collection(db, "peliculas"),
    orderBy("fecha", "desc")
  );

  const snap = await getDocs(q);

  let html = "";

  snap.forEach(doc => {
    const p = doc.data();

    html += `
      <div class="card">
        <img src="${p.portada}" alt="${p.titulo}">
        <h3>${p.titulo}</h3>
        <p>${p.categoria}</p>

        <a href="${p.video}" target="_blank" class="btn btn-primary">
          Ver película
        </a>
      </div>
    `;
  });

  contenedor.innerHTML = html;
}

cargarPeliculas();

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

  const snapshot = await getDocs(q);

  contenedor.innerHTML = "";

  snapshot.forEach((doc) => {

    const p = doc.data();

    contenedor.innerHTML += `
      <div class="card">
        <img src="${p.portada}" alt="${p.titulo}">
        <h3>${p.titulo}</h3>
        <p>${p.categoria}</p>

        <a href="ver.html?id=${doc.id}" class="btn">
          Ver película
        </a>
      </div>
    `;

  });

}

cargarPeliculas();

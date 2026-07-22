/* ============================================================
   JL NewReleases — admin.js
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  await renderDashboardStats();
  bindUploadForm();
  await renderEditableTable();
});

async function renderDashboardStats() {
  const wrap = document.getElementById("stat-grid");
  if (!wrap) return;
  const catalog = await loadCatalog();
  const nuevos = catalog.filter((v) => v.isNew).length;
  const categorias = new Set(catalog.map((v) => v.category)).size;

  wrap.innerHTML = `
    <div class="stat-card"><div class="value">${catalog.length}</div><div class="label">Videos totales</div></div>
    <div class="stat-card"><div class="value">${nuevos}</div><div class="label">Estrenos activos</div></div>
    <div class="stat-card"><div class="value">${categorias}</div><div class="label">Categorías</div></div>
  `;
}

function bindUploadForm() {
  const form = document.getElementById("upload-form");
  if (!form) return;
  const status = document.getElementById("upload-status");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // TODO: conectar con Storage/Firestore real para guardar el archivo y metadatos
    status.textContent = "Video guardado en el catálogo (simulado).";
    status.style.display = "block";
    form.reset();
  });
}

async function renderEditableTable() {
  const tbody = document.getElementById("videos-tbody");
  if (!tbody) return;
  const catalog = await loadCatalog();

  tbody.innerHTML = catalog
    .map(
      (v) => `
      <tr>
        <td>${v.id}</td>
        <td>${v.title}</td>
        <td>${v.category}</td>
        <td>${v.year}</td>
        <td>${v.isNew ? "Sí" : "No"}</td>
        <td><a href="editar.html?id=${v.id}">Editar</a></td>
      </tr>`
    )
    .join("");
}

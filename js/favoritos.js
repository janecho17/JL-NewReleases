/* ============================================================
   JL NewReleases — favoritos.js
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("favoritos-grid");
  const emptyState = document.getElementById("favoritos-empty");
  if (!grid) return;

  const favIds = JSON.parse(localStorage.getItem("jl_favoritos") || "[]");
  const catalog = await loadCatalog();
  const favVideos = catalog.filter((v) => favIds.includes(v.id));

  grid.innerHTML = favVideos.map((v) => videoCardHTML(v)).join("");
  emptyState.style.display = favVideos.length ? "none" : "block";
});

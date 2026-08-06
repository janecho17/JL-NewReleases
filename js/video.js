/* ============================================================
   JL NewReleases — video.js
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const catalog = await loadCatalog();
  const video = catalog.find((v) => String(v.id) === id) || catalog[0];

  if (!video) return;

  document.getElementById("video-title").textContent = video.title;
  document.getElementById("video-meta").textContent = `${video.category} · ${video.year}`;
  document.getElementById("video-desc").textContent =
    video.description || "Sin descripción disponible.";

  const player = document.getElementById("player");
  if (player) {
    player.innerHTML = video.url
      ? `<video src="${video.url}" controls style="width:100%;height:100%;"></video>`
      : `<span>Vista previa no disponible para "${video.title}"</span>`;
  }

  const favBtn = document.getElementById("fav-toggle");
  if (favBtn) {
    const favs = JSON.parse(localStorage.getItem("jl_favoritos") || "[]");
    const isFav = favs.includes(video.id);
    favBtn.textContent = isFav ? "★ En favoritos" : "☆ Agregar a favoritos";

    favBtn.addEventListener("click", () => {
      let list = JSON.parse(localStorage.getItem("jl_favoritos") || "[]");
      if (list.includes(video.id)) {
        list = list.filter((x) => x !== video.id);
        favBtn.textContent = "☆ Agregar a favoritos";
      } else {
        list.push(video.id);
        favBtn.textContent = "★ En favoritos";
      }
      localStorage.setItem("jl_favoritos", JSON.stringify(list));
    });
  }

  // Recomendados: misma categoría, distinto id
  const recWrap = document.getElementById("recomendados");
  if (recWrap) {
    const recs = catalog
      .filter((v) => v.category === video.category && v.id !== video.id)
      .slice(0, 6);
    recWrap.innerHTML = recs.map((v) => videoCardHTML(v)).join("") ||
      '<p class="muted">No hay recomendaciones por ahora.</p>';
  }
});

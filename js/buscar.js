/* ============================================================
   JL NewReleases — buscar.js
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  const emptyState = document.getElementById("search-empty");
  if (!input || !results) return;

  const catalog = await loadCatalog();

  function render(list) {
    results.innerHTML = list.map((v) => videoCardHTML(v)).join("");
    emptyState.style.display = list.length ? "none" : "block";
  }

  function search(term) {
    const q = term.trim().toLowerCase();
    if (!q) return render([]);
    const matches = catalog.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
    );
    render(matches);
  }

  input.addEventListener("input", (e) => search(e.target.value));

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q");
  if (initialQuery) {
    input.value = initialQuery;
    search(initialQuery);
  }
});

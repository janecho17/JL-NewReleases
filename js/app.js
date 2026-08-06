/* ============================================================
   JL NewReleases — app.js
   Header/footer compartidos + catálogo (Firestore, con respaldo
   en database/videos.json si aún no hay películas subidas).
   Se usa como <script> clásico (no module) para que loadCatalog()
   y videoCardHTML() queden disponibles como globales para el
   resto de páginas; internamente usa import() dinámico para
   hablar con Firebase sin convertir todo el sitio en módulos.
   ============================================================ */

const WHATSAPP_URL = "https://whatsapp.com/channel/0029Vb8YQlXATRSwmyuQTq1u";

const NAV_ITEMS = [
  { href: "index.html", label: "Inicio" },
  { href: "explorar.html", label: "Explorar" },
  { href: "categorias.html", label: "Categorías" },
  { href: "buscar.html", label: "Buscar" },
  { href: "favoritos.html", label: "Favoritos" }
];

const whatsappIcon = `<svg viewBox="0 0 32 32"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-1.9c1.8 1 3.9 1.6 6.1 1.6 6.6 0 12-5.4 12-12S22.6 3 16 3z"/></svg>`;

function renderHeader(){
  const slot = document.getElementById("site-header");
  if(!slot) return;
  const currentPage = document.body.dataset.page || "";

  slot.innerHTML = `
    <header class="site-header">
      <div class="container nav">
        <a href="index.html" class="brand">JL <span>NewReleases</span></a>
        <nav class="nav-links">
          ${NAV_ITEMS.map(item => `<a href="${item.href}" class="${item.href === currentPage ? "active" : ""}">${item.label}</a>`).join("")}
        </nav>
        <div class="nav-icons">
          <a class="whatsapp-link" href="${WHATSAPP_URL}" target="_blank" rel="noopener">${whatsappIcon}<span>WhatsApp</span></a>
          <span id="auth-slot"><a href="login.html" class="nav-links-item" style="font-size:.9rem;color:var(--text-muted);">Entrar</a></span>
        </div>
      </div>
    </header>
  `;

  // Estado de sesión (asíncrono, no bloquea el resto del render)
  import("./firebase.js").then(({ auth }) => {
    import("https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js").then(({ onAuthStateChanged }) => {
      onAuthStateChanged(auth, (user) => {
        const authSlot = document.getElementById("auth-slot");
        if(!authSlot) return;
        authSlot.innerHTML = user
          ? `<a href="perfil.html" style="font-size:.9rem;color:var(--text-muted);">${user.email}</a>`
          : `<a href="login.html" style="font-size:.9rem;color:var(--text-muted);">Entrar</a>`;
      });
    });
  }).catch(() => { /* Firebase no disponible offline; se ignora en la demo */ });
}

function renderFooter(){
  const slot = document.getElementById("site-footer");
  if(!slot) return;
  slot.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <p class="brand" style="font-size:1.1rem;">JL <span>NewReleases</span></p>
          <p class="mt-24" style="margin-top:8px;">Estrenos nuevos cada semana.</p>
        </div>
        <div>
          <a href="explorar.html">Explorar</a><br>
          <a href="categorias.html">Categorías</a><br>
          <a href="${WHATSAPP_URL}" target="_blank" rel="noopener">Canal de WhatsApp</a>
        </div>
      </div>
      <div class="container">© ${new Date().getFullYear()} JL NewReleases</div>
    </footer>
  `;
}

function fetchLocalCatalog(){
  // database/videos.json vive en la raíz del sitio; desde /admin/ hay que subir un nivel
  const inAdmin = window.location.pathname.includes("/admin/");
  const path = (inAdmin ? "../" : "") + "database/videos.json";
  return fetch(path).then(r => r.json()).catch(() => []);
}

let _catalogCache = null;

async function loadCatalog(){
  if(_catalogCache) return _catalogCache;

  try{
    const { db } = await import("./firebase.js");
    const { collection, getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js");
    const snap = await getDocs(query(collection(db, "peliculas"), orderBy("fecha", "desc")));

    if(!snap.empty){
      const now = Date.now();
      _catalogCache = snap.docs.map(doc => {
        const p = doc.data();
        const fechaMs = p.fecha && p.fecha.toMillis ? p.fecha.toMillis() : now;
        return {
          id: doc.id,
          title: p.titulo || "Sin título",
          category: p.categoria || "General",
          year: p.fecha && p.fecha.toDate ? p.fecha.toDate().getFullYear() : new Date().getFullYear(),
          isNew: (now - fechaMs) < 1000 * 60 * 60 * 24 * 30, // subido hace menos de 30 días
          description: p.descripcion || "",
          url: p.video || "",
          thumbnail: p.portada || ""
        };
      });
      return _catalogCache;
    }
  } catch(err){
    console.warn("No se pudo leer Firestore, usando catálogo local de ejemplo.", err);
  }

  // Respaldo: catálogo de ejemplo en database/videos.json
  _catalogCache = await fetchLocalCatalog();
  return _catalogCache;
}

function videoCardHTML(v){
  const poster = v.thumbnail
    ? `<img src="${v.thumbnail}" alt="${v.title}" style="width:100%;height:100%;object-fit:cover;">`
    : v.category;
  return `
    <a class="card" href="video.html?id=${v.id}">
      <div class="poster">
        ${v.isNew ? '<span class="badge-new">Nuevo</span>' : ""}
        ${poster}
      </div>
      <div class="info">
        <h3>${v.title}</h3>
        <p>${v.category}${v.year ? " · " + v.year : ""}</p>
      </div>
    </a>
  `;
}

// ---- Home: hero + marquesina + grilla de estrenos ----
async function renderHome(){
  const grid = document.getElementById("home-grid");
  const marquee = document.getElementById("marquee-track");
  if(!grid) return;

  const catalog = await loadCatalog();
  grid.innerHTML = catalog.slice(0, 12).map(v => videoCardHTML(v)).join("")
    || '<p class="muted">Todavía no hay estrenos. Sube el primero desde el panel de admin.</p>';

  if(marquee){
    const nuevos = catalog.filter(v => v.isNew);
    const items = (nuevos.length ? nuevos : catalog).map(v => `<span>★ ${v.title}</span>`).join("");
    marquee.innerHTML = items + items; // se duplica para el loop continuo del CSS
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  if(document.getElementById("home-grid")) renderHome();
});

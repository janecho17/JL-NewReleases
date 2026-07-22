# JL NewReleases

Plataforma de streaming (catálogo de videos/estrenos) construida en HTML, CSS y JavaScript puro, lista para conectarse a Firebase (Auth, Firestore, Storage) u otro backend.

## Estructura del proyecto

```
mi-streaming/
├── index.html              # Inicio (hero + marquesina de estrenos + catálogo)
├── explorar.html            # Catálogo completo con filtro por categoría
├── categorias.html          # Vista de categorías
├── buscar.html               # Búsqueda en vivo
├── video.html                 # Reproductor + recomendados + favoritos
├── login.html                 # Inicio de sesión
├── perfil.html                # Perfil del usuario
├── favoritos.html            # Videos guardados como favoritos
├── admin/
│   ├── dashboard.html      # Resumen de métricas
│   ├── subir.html            # Formulario para subir un nuevo video
│   ├── editar.html           # Tabla de edición del catálogo
│   └── estadisticas.html   # Estadísticas del sitio
├── css/
│   ├── style.css              # Sistema de diseño principal
│   ├── responsive.css     # Ajustes para móvil/tablet
│   └── admin.css             # Estilos del panel admin
├── js/
│   ├── app.js                  # Header/footer compartidos + utilidades + carga de catálogo
│   ├── buscar.js               # Lógica de búsqueda
│   ├── video.js                 # Lógica del reproductor
│   ├── auth.js                  # Login simulado (reemplazar por Firebase Auth)
│   ├── favoritos.js           # Lógica de favoritos (localStorage)
│   └── admin.js                # Lógica del panel admin
├── assets/
│   ├── logo.png                (agrega tu logo aquí)
│   ├── banners/
│   ├── posters/
│   └── iconos/
├── database/
│   └── videos.json           # Catálogo de ejemplo
└── README.md
```

## Cómo probarlo

1. Descomprime el proyecto.
2. Abre `index.html` en tu navegador (recomendado: sírvelo con un servidor local, por ejemplo `npx serve` o la extensión "Live Server" de VS Code, para que `fetch()` cargue `database/videos.json` correctamente).

## Próximos pasos sugeridos

- Conectar `js/auth.js` a Firebase Authentication (correo/contraseña, Google, etc.).
- Reemplazar `database/videos.json` por consultas a Firestore.
- Subir los archivos de video reales a Firebase Storage y usar sus URLs en `video.url`.
- Agregar tu logo real en `assets/logo.png` y tus posters en `assets/posters/`.

## Canal de WhatsApp

Todas las páginas incluyen un enlace directo al canal de WhatsApp de JL NewReleases:
https://whatsapp.com/channel/0029Vb8YQlXATRSwmyuQTq1u

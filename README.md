# JL NewReleases

Plataforma de streaming (catálogo de videos/estrenos) construida en HTML, CSS y JavaScript puro, conectada a Firebase (Auth, Firestore, Storage).

## Estructura del proyecto

```
JL-NewReleases/
├── index.html              # Inicio (hero + marquesina de estrenos + catálogo)
├── explorar.html            # Catálogo completo con filtro por categoría
├── categorias.html          # Vista de categorías
├── buscar.html               # Búsqueda en vivo
├── video.html                 # Reproductor + recomendados + favoritos
├── login.html                 # Inicio de sesión (Firebase Auth)
├── registro.html              # Crear cuenta (Firebase Auth)
├── perfil.html                # Perfil del usuario
├── favoritos.html            # Videos guardados como favoritos (localStorage)
├── admin/
│   ├── dashboard.html      # Resumen de métricas
│   ├── subir.html            # Formulario para subir un nuevo video (Storage + Firestore)
│   ├── editar.html           # Tabla de edición del catálogo
│   └── estadisticas.html   # Estadísticas del sitio
├── css/
│   ├── style.css              # Sistema de diseño principal
│   ├── responsive.css     # Ajustes para móvil/tablet
│   └── admin.css             # Estilos del panel admin
├── js/
│   ├── firebase.js            # Configuración e inicialización de Firebase
│   ├── app.js                  # Header/footer compartidos + catálogo (Firestore, con respaldo local)
│   ├── auth.js                  # Login con Firebase Auth
│   ├── registro.js             # Registro con Firebase Auth
│   ├── admin-subir.js         # Subida de video/portada a Storage + guardado en Firestore
│   ├── admin.js                # Dashboard y tabla de edición del panel admin
│   ├── buscar.js               # Lógica de búsqueda
│   ├── video.js                 # Lógica del reproductor
│   └── favoritos.js           # Lógica de favoritos (localStorage)
├── database/
│   └── videos.json           # Catálogo de ejemplo (respaldo si Firestore está vacío)
└── README.md
```

## Cómo probarlo

Sirve la carpeta con un servidor local (recomendado, para que `fetch()` funcione bien):
```bash
npx serve .
```
o usa la extensión "Live Server" de VS Code. Abrir `index.html` con doble clic también funciona, salvo la carga del catálogo de respaldo (`database/videos.json`), que necesita servidor.

## Cómo funciona el catálogo

`js/app.js` intenta leer la colección `peliculas` de Firestore. Si aún no subiste ningún video, usa automáticamente `database/videos.json` como catálogo de ejemplo. En cuanto subas tu primer video desde `admin/subir.html`, el catálogo real reemplaza al de ejemplo en todas las páginas.

## Cuenta de administrador

`admin/subir.html` solo deja publicar a la cuenta cuyo correo está en `js/admin-subir.js` (línea con `user.email !== "..."`). Cambia ese correo si quieres dar acceso de admin a otra cuenta, y créala primero desde `registro.html`.

## ⚠️ Importante: agrega reglas de seguridad en Firestore y Storage

Ahora mismo, la verificación de "¿eres admin?" ocurre solo en el navegador (JavaScript), lo cual **no es suficiente por sí solo**: cualquiera que conozca tu configuración de Firebase podría escribir directo a la base de datos sin pasar por tu sitio. Para cerrar esto de verdad, entra a la consola de Firebase → Firestore → Reglas, y usa algo como:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /peliculas/{id} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == "TU-CORREO-ADMIN@ejemplo.com";
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Y en Storage → Reglas, algo equivalente restringiendo `write` a tu correo de admin.

## Sobre el almacenamiento de video

Firebase Storage funciona bien para empezar, pero su plan gratuito (Spark) es limitado en espacio y no permite subir archivos grandes de forma sostenida; para volumen real (varios videos de +10 GB) probablemente necesites el plan de pago (Blaze) o migrar los archivos de video a un servicio pensado para eso (Bunny Stream, Cloudflare R2 + CDN), manteniendo Firestore solo para los metadatos y Firebase Auth para las cuentas.

## Canal de WhatsApp

Todas las páginas incluyen un enlace directo al canal de WhatsApp de JL NewReleases:
https://whatsapp.com/channel/0029Vb8YQlXATRSwmyuQTq1u

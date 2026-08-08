const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    // Permitir las peticiones CORS del navegador
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    // ==============================
    // SUBIR ARCHIVO
    // ==============================

    if (request.method === "POST" && url.pathname === "/upload") {

      try {

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
          return new Response(
            JSON.stringify({
              error: "No se recibió ningún archivo."
            }),
            {
              status: 400,
              headers: {
                ...CORS_HEADERS,
                "Content-Type": "application/json"
              }
            }
          );
        }

        const nombre = file.name;
        const tipo = file.type || "application/octet-stream";

        let carpeta = "archivos";

        if (tipo.startsWith("image/")) {
          carpeta = "portadas";
        }

        if (tipo.startsWith("video/")) {
          carpeta = "videos";
        }

        const nombreSeguro = nombre.replace(/[^a-zA-Z0-9._-]/g, "_");

        const key =
          `${carpeta}/${Date.now()}_${nombreSeguro}`;

        await env.BUCKET.put(
          key,
          file.stream(),
          {
            httpMetadata: {
              contentType: tipo
            }
          }
        );

        return new Response(
          JSON.stringify({
            success: true,
            key: key,
            url: `${url.origin}/files/${encodeURIComponent(key)}`
          }),
          {
            status: 200,
            headers: {
              ...CORS_HEADERS,
              "Content-Type": "application/json"
            }
          }
        );

      } catch (error) {

        console.error(error);

        return new Response(
          JSON.stringify({
            error: error.message
          }),
          {
            status: 500,
            headers: {
              ...CORS_HEADERS,
              "Content-Type": "application/json"
            }
          }
        );
      }
    }

    // ==============================
    // MOSTRAR ARCHIVO
    // ==============================

    if (
      request.method === "GET" &&
      url.pathname.startsWith("/files/")
    ) {

      const key = decodeURIComponent(
        url.pathname.replace("/files/", "")
      );

      const object = await env.BUCKET.get(key);

      if (!object) {
        return new Response(
          "Archivo no encontrado",
          {
            status: 404,
            headers: CORS_HEADERS
          }
        );
      }

      const headers = new Headers(CORS_HEADERS);

      object.writeHttpMetadata(headers);

      headers.set(
        "etag",
        object.httpEtag
      );

      return new Response(
        object.body,
        {
          headers
        }
      );
    }

    // ==============================
    // RESPUESTA PRINCIPAL
    // ==============================

    return new Response(
      "JL New Releases API funcionando",
      {
        headers: CORS_HEADERS
      }
    );
  }
};

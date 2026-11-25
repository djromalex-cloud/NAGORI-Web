# NAGORI — sitio web

Página oficial del videojuego **NAGORI** (Utsuroi Studios). Es un sitio estático (HTML, CSS y JS), sin dependencias ni compilación.

## Cambiar el link de descarga
Abre `main.js` y edita el bloque `CONFIG` del inicio:

```js
descargaUrl: "https://tu-link-de-descarga",
tamano: "350 MB",
encuestaUrl: "https://forms.gle/..."
```

## Publicar en Vercel
1. Sube esta carpeta a un repositorio nuevo de GitHub (por ejemplo `nagori-web`).
2. En vercel.com: **Add New → Project → Import** ese repositorio.
3. Framework Preset: **Other**. No hace falta Build Command ni Output Directory.
4. **Deploy**. Cada vez que hagas push, Vercel actualiza la página sola.

## Estructura
- `index.html` — contenido de la página
- `styles.css` — estilos
- `main.js` — animaciones, pétalos, música y configuración
- `assets/img` — sprites y fondos del juego (WebP)
- `assets/media` — tráiler y música del menú
- `assets/fonts` — Anton, Oswald y Hana Serif (licencia SIL OFL)

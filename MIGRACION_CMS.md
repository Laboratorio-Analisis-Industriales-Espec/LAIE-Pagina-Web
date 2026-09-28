# Migración a Astro + Keystatic — qué onda

Migración del sitio estático original (`../PaginaWeb`: 7 HTML + `styles.css` + `script.js`)
a un sitio moderno con CMS editable y deploy en Vercel.

## 1. Qué se hizo y por qué

| Antes | Ahora |
|---|---|
| HTML duplicado en 7 archivos (header/footer copiados) | Un layout `src/layouts/Base.astro` compartido |
| Contenido quemado en el HTML (solo editable por programador) | Contenido en `src/content/*.yaml` + `sitio.json`, editable desde UI web |
| Formularios falsos (“demo local, sin backend”) | Endpoints reales `POST /api/contacto` y `/api/reserva` (serverless) |
| Sin forma de publicar | Push a GitHub → Vercel construye y publica solo |

**Por qué Astro:** genera HTML estático (rápido, barato, SEO igual que antes), pero con
componentes y colecciones de contenido. El diseño (`styles.css`) se reutilizó tal cual.

**Por qué Keystatic:** es un CMS *basado en Git*. No hay base de datos ni servicio externo:
cada cambio que un editor hace en la UI se guarda como commit de archivos YAML en el repo.
Ideal para contenido general de un laboratorio (cursos, personal, equipos, reglamento…),
no solo avisos.

## 2. Estructura del proyecto

```
PaginaWeb-astro/
├── keystatic.config.ts        # Modelo del CMS: qué colecciones existen y qué campos tiene cada una
├── src/content.config.ts      # Esquemas de Astro que leen esos mismos archivos
├── src/content/
│   ├── sitio.json             # Singleton: datos generales (teléfono, correo, misión, hero…)
│   ├── cursos/*.yaml          # 6 materias migradas del HTML original
│   ├── personal/*.yaml        # 7 personas (responsable, profesores, técnicos)
│   ├── proyectos/*.yaml       # 7 proyectos (integradores, tesis, clubes)
│   ├── equipos/*.yaml         # 8 equipos del inventario
│   ├── reglas/*.yaml          # 6 reglas del reglamento
│   └── avisos/*.yaml          # 3 avisos del tablón (una colección más, no el centro)
├── src/layouts/Base.astro     # Header, nav, footer compartidos
├── src/pages/                 # index, cursos, proyectos, infraestructura, personal, reglamento, contacto
│   └── api/                   # contacto.ts, reserva.ts (serverless functions)
├── public/                    # styles.css y script.js (mismo diseño e interacciones)
├── astro.config.mjs           # Astro + adaptador Vercel + Keystatic
└── vercel.json
```

## 3. Modelo de contenido (CMS general)

Todo es editable sin tocar código, en local (`/keystatic`) o en producción (ver §5):

- **Datos generales del sitio** (singleton): nombre, teléfono, correo, ubicación,
  título principal, misión y visión.
- **Cursos y materias**: nombre, área, semestre, descripción, profesor, contacto,
  programa sintético (lista) y calendario de prácticas (lista).
- **Personal**: nombre, rol, grupo (responsable / profesores / técnicos), semblanza,
  correo e iniciales del avatar.
- **Proyectos**: título, tipo (integrador / tesis / club), etiqueta, descripción y dato extra.
- **Equipos e infraestructura**: nombre, cantidad, uso típico y requisito
  (con asesoría / libre con registro / préstamo en ventanilla).
- **Reglamento**: texto de cada regla + categoría.
- **Novedades**: tablón de avisos (categoría, texto, nivel normal/advertencia/urgente).

Agregar un archivo nuevo en cualquiera de esas carpetas (a mano o desde el CMS)
= nuevo contenido publicado en el siguiente deploy. Nada de esto requiere programar.

## 4. Cómo correrlo en local

```bash
cd PaginaWeb-astro
npm install
npm run dev        # sitio en http://localhost:4321
```

- CMS local: abre `http://localhost:4321/keystatic` (requiere `npm run dev`, no el build).
- Edita algo, guarda, y verás el cambio como archivos modificados en `git status`.
- `npm run build` verifica que todo compila (así construye Vercel también).

## 5. Publicar en Vercel + GitHub

1. Crea un repo en GitHub y sube esta carpeta a `main`:
   ```bash
   git init && git add -A && git commit -m "Migración Astro + Keystatic"
   git remote add origin git@github.com:TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```
2. En Vercel: **Add New → Project → Import** el repo.
   - Framework: `Astro` (autodetectado), Build: `astro build`. Sin más configuración.
   - Las páginas salen como HTML estático; `/api/*` salen como serverless functions.
3. Cada push a `main` redespliega. Cada PR genera una URL de preview.

### Edición en producción (que no-técnicos publiquen sin Git)

Por defecto Keystatic usa `storage: { kind: 'local' }` (solo edición en local).
Para activar el panel en el sitio publicado:

1. En `keystatic.config.ts` cambia a:
   ```ts
   storage: { kind: 'github', repo: 'TU_USUARIO/TU_REPO' }
   ```
2. Sigue la guía oficial para crear la GitHub App de Keystatic e instalarla en el repo
   (https://keystatic.com/docs/github-mode).
3. Los editores entran a `tusitio.vercel.app/keystatic`, inician sesión con GitHub
   y cada “Guardar” crea un commit → Vercel redespliega solo.

## 6. Formularios (contacto y reserva)

Antes eran demo local. Ahora:

- `POST /api/contacto` recibe `{ nombre, correo, mensaje }`.
- `POST /api/reserva` recibe `{ nombre, correo, recurso, fecha, motivo }`.
- Ambos validan y responden JSON; el `script.js` ya los consume con `fetch`
  (usa el atributo `data-api` del `<form>`).
- **Sin configurar nada**: validan, registran en logs de Vercel y responden “recibido”.
- **Para recibir correos de verdad**: crea cuenta en [Resend](https://resend.com),
  y en Vercel → Settings → Environment Variables define:
  `RESEND_API_KEY` y `CONTACT_EMAIL`. Sin cambiar código, los endpoints
  empiezan a reenviar cada mensaje a ese correo.

## 7. Qué sigue / pendientes conocidos

- Cambiar datos de ejemplo: correos `@ejemplo.mx`, teléfono provisional, docentes
  “por asignar” — todo editable desde el CMS, sin código.
- Subir PDFs reales de guías/formatos a `public/guias/` y enlazarlos
  (hoy los botones de descarga son `#`).
- Sustituir el mapa de ejemplo en Contacto por iframe o imagen real.
- Galería de proyectos: hoy son tarjetas de texto; la colección `proyectos`
  admite después un campo `imagen`.
- Horario semanal de Contacto quedó como tabla fija en la página; si cambia seguido,
  conviene pasarlo a colección del CMS igual que equipos.
- Fijar Node 24 en local (nvm) para igualar el runtime de Vercel (aviso del build).

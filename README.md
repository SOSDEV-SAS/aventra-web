# Aventra Web

Experiencia inmersiva de Aventra: Rodadas, identidad de la moto, cuidados,
comunidad y descarga preliminar para Android. Incluye ilustraciones de Aventra,
modo nocturno, navegación por capítulos y movimiento reducido.

La sección «03 — Tu moto y su historia» presenta ocho planos generados
individualmente sin referencias textuales a fabricantes. GSAP ScrollTrigger
controla los fundidos y el acercamiento al desplazarse, conservando los cuatro
capítulos y sus textos. Con movimiento reducido o menos de 700 píxeles de alto,
se mantiene la lectura vertical sin escenario fijo.

Los WebP de `public/illustrations/moto-cinema-v2/` incluyen versiones móviles,
1920 × 1080 y 3840 × 2160. Las versiones 4K son ampliaciones de originales
generados a 1672 × 941, no generación 4K nativa. Los prompts y la procedencia
están en `docs/moto-cinema-v2.json`.

## Desarrollo

Requiere Node.js 22.13 o posterior.

```sh
npm ci
npm run dev
```

Abrir `http://localhost:5187`. Comprobaciones:

```sh
npm run typecheck
npm run build
```

Las escenas iniciales usan exclusivamente ilustraciones de Aventra incluidas
en `public/illustrations`. El editor permite ordenar u ocultar escenas y, en una
sesión de edición, añadir videos propios MP4, WebM o MOV (hasta 90 MB).
Solo subas material autorizado y evita datos personales de terceros.

En desarrollo, «Activar edición local» crea una sesión simulada solo en loopback,
sin cuentas reales. Los datos se guardan en R2 emulado en `.wrangler/state`, fuera
de Git. No borres ese directorio si quieres conservar tus cambios locales.
Cada instalación comienza con una configuración nueva de Aventra, versión 3.

El build utiliza Vinext/Vite y Cloudflare Workers con un binding R2 `BUCKET`.
Sin identidad autenticada, la web permite leer el contenido pero rechaza subidas
y guardados. La edición en producción requiere un gateway confiable de identidad
y `IDENTITY_SHARED_SECRET` configurado fuera del repositorio. Ese gateway debe
retirar los headers `x-aventra-*` del cliente antes de inyectar una identidad
autenticada. La sesión simulada nunca se incluye en el build de producción.
No se incluye configuración operativa del servidor.

La descarga está desactivada en `config/downloads.json`. Para habilitarla deben
existir una APK firmada y un manifiesto válido en las rutas del mismo origen
de `lib/release.ts`. El interruptor no elude esas comprobaciones.

## Derechos y privacidad

Copyright © 2026 Santiago Osorio Soto, quien utiliza el nombre Sosdev.
Los contenidos propios tienen una [licencia propietaria](LICENSE).
La visibilidad pública no equivale a código abierto; se respetan los derechos
de visualización y fork de GitHub. Los componentes de terceros conservan sus
licencias en [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) y sus paquetes.

Términos, privacidad y copyright están disponibles desde el pie de página.
Contacto: contacto@sosdev.com.co. Publicar código no despliega la web ni acredita
una certificación de cumplimiento legal.

## Distribución pública sin edición

`npm run build && npm run export:public` genera `out/` con el contenido público y
las páginas legales. El Dockerfile usa Nginx para esta distribución de solo
lectura: la edición, las sesiones simuladas y las subidas no se exponen. La
configuración y los videos privados locales no se exportan. Las funciones de
edición siguen disponibles en el entorno de desarrollo descrito arriba.

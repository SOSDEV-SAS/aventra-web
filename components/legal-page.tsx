export function LegalPage({title,children}:{title:string;children:React.ReactNode}) {
 return <main className="legal-page"><a className="wordmark" href="/"><img src="/brand.svg" width="32" height="32" alt=""/>Aventra</a><p className="eyebrow">INFORMACIÓN DEL SITIO · 12 NOVIEMBRE 2026</p><h1>{title}</h1>{children}<nav aria-label="Información legal"><a href="/terminos">Términos</a><a href="/privacidad">Privacidad</a><a href="/derechos">Derechos de autor</a></nav><p><a href="/">Volver a Aventra →</a></p></main>;
}

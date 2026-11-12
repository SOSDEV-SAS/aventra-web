import {ArrowUpRight,BookOpen,CalendarDays,Compass,Flag,HeartHandshake,MessagesSquare,Navigation,Route,ShieldCheck,Sparkles,Users} from 'lucide-react';
import type {EditorialContent} from '@/lib/aventra-content';
import {MotorcycleStory} from './motorcycle-story';

function ChapterLabel({number,children}:{number:string;children:React.ReactNode}){return <p className="chapter-label"><span>{number}</span><i/>{children}</p>;}
function ChapterTitle({children}:{children:string}){return <h2 className="editorial-heading reveal">{children}</h2>;}
export function EditorialChapters({content,blocked=false}:{content:EditorialContent;blocked?:boolean}){
 return <>
  <section className="rodadas-section section-space" id="rodadas-detalles" aria-label="Organiza y comparte una rodada">
   <figure className="wide-illustration reveal"><img src="/illustrations/rodadas-3d-v1.webp" alt="Escena 3D de tres motociclistas en una parada, con motos Adventure, urbana, todoterreno y naked de mayor cilindraje" width="1672" height="941" loading="lazy"/><figcaption><span>DISTINTAS MOTOS. UN MISMO CAMINO.</span><span><Route size={15}/>Rodadas · Aventra</span></figcaption></figure>
   <div className="ride-steps"><article className="reveal"><span className="step-icon"><Flag size={21}/></span><small>01 / ANTES DE SALIR</small><h3>Propón el plan.</h3><p>Define fecha, hora, municipio, dificultad y cupos. Añade el punto de encuentro, el destino y las paradas de la salida.</p></article><article className="reveal"><span className="step-icon"><Users size={21}/></span><small>02 / EN COMPAÑÍA</small><h3>Confirma tu lugar.</h3><p>Encuentra próximas salidas y confirma tu participación con una de tus motos, según los cupos disponibles.</p></article><article className="reveal"><span className="step-icon"><Route size={21}/></span><small>03 / UN MISMO CAMINO</small><h3>Comparte la ruta.</h3><p>Comparte la rodada con un enlace o QR. Consulta el destino y sus paradas en Google Maps.</p></article></div>
   <div className="privacy-note"><ShieldCheck size={17}/><p>El punto exacto de encuentro se muestra al organizador y a quienes tienen su participación confirmada. La ruta se abre en Google Maps; Aventra no ofrece navegación ni seguimiento en vivo.</p></div>
  </section>

  <MotorcycleStory content={content} blocked={blocked}/>

  <section className="care-section section-space" id="tranquilidad">
   <div className="section-top"><ChapterLabel number="04">TRANQUILIDAD PARA AVANZAR</ChapterLabel><Compass size={22}/></div>
   <div className="care-grid"><div className="care-copy"><ChapterTitle>{content.careTitle}</ChapterTitle><p className="section-lead reveal">{content.careIntro}</p><a href="#descarga" className="inline-link">Cuida lo importante<ArrowUpRight size={17}/></a></div><div className="care-features"><article className="reveal"><ShieldCheck/><div><h3>Obligaciones de tu moto</h3><p>Consulta las fuentes oficiales y conserva tus registros y fechas. Lo que confirmas no equivale a una verificación automática de las entidades.</p></div></article><article className="reveal"><CalendarDays/><div><h3>Recordatorios que acompañan</h3><p>Activa recordatorios locales de vencimientos y mantenimiento. Requieren una app compatible y tu permiso para notificaciones.</p></div></article><article className="reveal"><Navigation/><div><h3>Pico y placa, con contexto</h3><p>Elige dónde circulas y consulta las reglas disponibles para esa zona. Revisa su vigencia, la fuente oficial y las excepciones antes de salir.</p></div></article></div></div>
   <div className="care-statement">La aventura empieza<br/>con la <em>tranquilidad.</em><span>EL PRÓXIMO DESTINO PUEDE ESPERAR.<br/>LO IMPORTANTE MERECE SU MOMENTO.</span></div>
  </section>

  <section className="community-section section-space" id="comunidad">
   <div className="section-top"><ChapterLabel number="05">COMUNIDAD Y CONOCIMIENTO</ChapterLabel><span className="section-aside">UN COMPAÑERO, TAMBIÉN PARA TUS PREGUNTAS.</span></div>
   <div className="split-intro"><ChapterTitle>{content.communityTitle}</ChapterTitle><p className="intro-paragraph reveal">{content.communityIntro}</p></div>
   <div className="knowledge-grid"><article className="knowledge-card reveal"><MessagesSquare size={29} strokeWidth={1.2}/><span className="card-index">01 / COMUNIDAD</span><h3>Conversaciones que ayudan.</h3><p>Pregunta, comparte respuestas y participa en el foro. Puedes votar, reportar contenido o bloquear usuarios.</p><span className="knowledge-foot">FORO Y COMUNIDAD<ArrowUpRight size={16}/></span></article><article className="knowledge-card reveal"><BookOpen size={29} strokeWidth={1.2}/><span className="card-index">02 / REFERENCIAS</span><h3>Conoce mejor tu moto.</h3><p>Consulta el manual oficial disponible para tu moto. Si falta, puedes enviar un PDF, un enlace oficial o una solicitud para localizarlo.</p><small>Las solicitudes se revisan antes de incorporarse al catálogo y al asistente.</small><span className="knowledge-foot">MANUALES POR MODELO<ArrowUpRight size={16}/></span></article><article className="knowledge-card reveal"><Sparkles size={29} strokeWidth={1.2}/><span className="card-index">03 / CONTEXTO</span><h3>Preguntas con un punto de partida.</h3><p>Haz preguntas sobre tu moto con apoyo de su manual oficial validado, cuando el asistente esté habilitado para tu modelo.</p><small>Las respuestas son orientativas y no sustituyen una revisión profesional. Revisa las fuentes y las diferencias de versión.</small><span className="knowledge-foot">ASISTENTE CONTEXTUAL<ArrowUpRight size={16}/></span></article></div>
   <div className="support-strip"><span>Y LO QUE HACE POSIBLE SEGUIR.</span><p>Tu cuenta y recuperación de acceso.<br/>Un espacio para compartir tus comentarios.</p><HeartHandshake size={29} strokeWidth={1.2}/></div>
  </section>

  <section className="philosophy-section section-space" id="esencia">
   <div className="section-top"><ChapterLabel number="06">LO QUE MUEVE A AVENTRA</ChapterLabel><span className="section-aside">ANTES. DURANTE. DESPUÉS.</span></div>
   <div className="philosophy-opening"><ChapterTitle>{content.philosophyTitle}</ChapterTitle><p className="section-lead reveal">{content.philosophyIntro}</p></div>
   <div className="journey-illustration reveal"><img src="/illustrations/camino-3d-v1.webp" alt="Escena 3D de un motociclista con casco y su moto Adventure detenida en un mirador sobre una ciudad entre montañas" width="1672" height="941" loading="lazy"/><div className="journey-note">No importa si es una gran salida<br/>o el camino de todos los días.</div></div>
   <div className="journey-steps"><article className="reveal"><span className="route-node"/><small>ANTES</small><h3>Prepararte.</h3><p>Conocer tu moto, organizar sus cuidados y tener presente lo importante.</p></article><article className="reveal"><span className="route-node"/><small>DURANTE</small><h3>Disfrutar el camino.</h3><p>Explorar con autonomía y compartir una salida con otros motociclistas.</p></article><article className="reveal"><span className="route-node"/><small>DESPUÉS</small><h3>Conservar la historia.</h3><p>Reunir los registros de tu moto y el contexto que te ayuda a seguir avanzando.</p></article></div>
   <div className="principles-band"><span>Confianza.</span><span>Cuidado.</span><span>Autonomía.</span><span>Comunidad.</span></div>
  </section>
 </>;
}

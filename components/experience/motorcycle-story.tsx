'use client';

import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {ArrowDown,ArrowUpRight,Bike,Check,ChevronLeft,ChevronRight,Fuel,Gauge,Wrench} from 'lucide-react';
import {moduleGroups,type EditorialContent} from '@/lib/aventra-content';

export function MotorcycleStory({content,blocked}:{content:EditorialContent;blocked:boolean}){
 const root=useRef<HTMLElement>(null),stage=useRef<HTMLDivElement>(null);
 const [active,setActive]=useState(0),[enhanced,setEnhanced]=useState(false);
 const chapters=useMemo(()=>[
  {id:'identidad',label:'Identidad',title:content.motoTitle,text:content.motoIntro,icon:Bike,tags:['Perfil de la moto','Personalización'],view:'identity'},
  {id:'historia',label:'Kilómetros',title:'Cada kilómetro deja su historia.',text:moduleGroups.find(group=>group.id==='after')!.items.find(item=>item.id==='odometer')!.description,icon:Gauge,tags:['Odómetro','Historial de lecturas'],view:'history'},
  {id:'cuidados',label:'Cuidados',title:'Cuidar también es avanzar.',text:'Registra los mantenimientos y conserva el contexto de los cuidados de tu moto. Lo que hiciste también te ayuda a entender lo que viene.',icon:Wrench,tags:['Registro de mantenimiento','Historial de cuidados'],view:'care'},
  {id:'combustible',label:'Combustible',title:'Cada carga también cuenta.',text:'Registra cargas y gastos de combustible. El consumo se estima cuando hay registros suficientes entre tanques llenos.',icon:Fuel,tags:['Registro de combustible','Métricas según tus registros'],note:'El acceso por NFC requiere un teléfono Android con NFC habilitado y la app compilada instalada.',view:'fuel'},
 ],[content.motoTitle,content.motoIntro]);

 useEffect(()=>{
  const motion=matchMedia('(prefers-reduced-motion:reduce), (max-height:699px)');
  const update=()=>setEnhanced(!motion.matches);update();
  motion.addEventListener('change',update);
  return()=>motion.removeEventListener('change',update);
 },[]);

 useEffect(()=>{
  if(!enhanced||blocked)return;
  let frame=0;
  const update=()=>{
   cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{
    const element=root.current,scene=stage.current;if(!element||!scene)return;
    const distance=element.offsetHeight-scene.offsetHeight;
    const progress=Math.max(0,Math.min(1,-element.getBoundingClientRect().top/Math.max(1,distance)));
    element.style.setProperty('--moto-progress',String(progress));
    setActive(Math.min(chapters.length-1,Math.floor(progress*chapters.length)));
   });
  };
  update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',update);window.removeEventListener('resize',update);};
 },[enhanced,blocked,chapters.length]);

 const select=useCallback((index:number)=>{
  const target=Math.max(0,Math.min(chapters.length-1,index));
  if(!enhanced){document.getElementById(`moto-${chapters[target].id}`)?.scrollIntoView({behavior:'auto'});return;}
  const element=root.current,scene=stage.current;if(!element||!scene)return;
  const top=scrollY+element.getBoundingClientRect().top;
  window.scrollTo({top:top+(element.offsetHeight-scene.offsetHeight)*(target+.18)/chapters.length,behavior:'smooth'});
 },[enhanced,chapters]);

 return <section id="moto" ref={root} className={`motorcycle-story${enhanced?' is-enhanced':''}`} data-view={chapters[active].view} aria-label="Tu moto y su historia">
  <div className="moto-story-stage" ref={stage}>
   <div className="moto-story-backdrop" role="img" aria-label={!enhanced||active===0?'Perfil conceptual 3D de una moto en Aventra: nombre ilustrativo Mi compañera, tema del perfil y tarjeta de propiedad. No es una captura de la app.':'Escena conceptual 3D de una moto urbana verde y marfil en un patio colombiano'}>
    <picture className="moto-story-picture">
     <source media="(max-width:767px)" srcSet="/illustrations/moto-historia-movil-3d-v1.webp"/>
     <img src="/illustrations/moto-historia-3d-v1.webp" width="1672" height="941" alt="" loading="lazy" decoding="async"/>
    </picture>
    <img className="moto-story-history-image" src="/illustrations/cuidados-3d-v1.webp" width="1448" height="1086" alt="" loading="lazy" decoding="async"/>
    <div className="moto-story-identity-image"><img src="/illustrations/moto-identidad-digital-3d-v2.webp" width="1672" height="941" alt="" loading="lazy" decoding="async"/></div>
   </div>
   <div className="moto-story-shade" aria-hidden="true"/>
   <div className="moto-story-topline"><p><span>03</span><i/>TU MOTO Y SU HISTORIA</p><span>EL CAMINO CAMBIA.<br/>SU HISTORIA SIGUE CONTIGO.</span></div>
   <div className="moto-story-scenes">{chapters.map((chapter,index)=><article id={`moto-${chapter.id}`} key={chapter.id} className="moto-story-scene" data-active={active===index} inert={enhanced&&active!==index} aria-hidden={enhanced&&active!==index}>
    <p className="moto-story-kicker"><chapter.icon size={19}/><span>{String(index+1).padStart(2,'0')} / {chapter.label}</span></p>
    {index===0?<h2>{chapter.title}</h2>:<h3>{chapter.title}</h3>}
    <p className="moto-story-text">{chapter.text}</p>
    <ul className="moto-story-tags">{chapter.tags.map(tag=><li key={tag}><Check size={13}/>{tag}</li>)}</ul>
    {chapter.note&&<details className="moto-story-note"><summary>NFC en Android</summary><p>{chapter.note}</p></details>}
   </article>)}</div>
   <div className="moto-story-console">
    <span className="moto-story-count">{String(active+1).padStart(2,'0')}<i/>04</span>
    <nav aria-label="Momentos de tu moto" onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();select(active+(event.key==='ArrowRight'?1:-1));}}}>{chapters.map((chapter,index)=><button key={chapter.id} onClick={()=>select(index)} aria-current={active===index?'step':undefined} aria-label={`Ver ${chapter.label.toLowerCase()} de tu moto`}><span>{String(index+1).padStart(2,'0')}</span>{chapter.label}</button>)}</nav>
    <div className="moto-story-arrows"><button onClick={()=>select(active-1)} disabled={active===0} aria-label="Momento anterior de tu moto"><ChevronLeft size={21}/></button>{active===chapters.length-1?<a href="#tranquilidad" aria-label="Continuar a tranquilidad"><ArrowUpRight size={21}/></a>:<button onClick={()=>select(active+1)} aria-label="Siguiente momento de tu moto"><ChevronRight size={21}/></button>}</div>
   </div>
   {enhanced&&active<3?<button className="moto-story-next" onClick={()=>select(active+1)}><span>Sigue su historia</span><ArrowDown size={17}/></button>:<a className="moto-story-next" href="#tranquilidad"><span>Sigue avanzando con tranquilidad</span><ArrowDown size={17}/></a>}
  </div>
 </section>;
}

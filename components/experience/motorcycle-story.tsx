'use client';

import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {ArrowDown,ArrowUpRight,Bike,Check,ChevronLeft,ChevronRight,Fuel,Gauge,Wrench} from 'lucide-react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {moduleGroups,type EditorialContent} from '@/lib/aventra-content';

const frames=Array.from({length:8},(_,index)=>index+1);

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
  const motion=matchMedia('(prefers-reduced-motion:reduce), (max-height:499px), (min-width:768px) and (max-height:699px)');
  const update=()=>setEnhanced(!motion.matches);update();
  motion.addEventListener('change',update);
  return()=>motion.removeEventListener('change',update);
 },[]);

 useEffect(()=>{
  if(!enhanced||blocked)return;
  gsap.registerPlugin(ScrollTrigger);
  const element=root.current,scene=stage.current;
  if(!element||!scene)return;
  const context=gsap.context(()=>{
   const images=gsap.utils.toArray<HTMLElement>('.moto-cinema-frame',element);
   gsap.set(images,{autoAlpha:0,scale:1.035});
   gsap.set(images[0],{autoAlpha:1});
   // Eight shots, two per chapter. CSS sticky owns layout; ScrollTrigger owns playback.
   const timeline=gsap.timeline({
    defaults:{ease:'none'},
    scrollTrigger:{id:'moto-cinema',trigger:element,start:'top top',
     end:()=>`+=${element.offsetHeight-scene.offsetHeight}`,scrub:0.45,invalidateOnRefresh:true},
    onUpdate(){setActive(Math.min(chapters.length-1,Math.floor(this.progress()*chapters.length)));},
   });
   images.forEach((image,index)=>{
    const start=index;
    if(index>0){
     timeline.to(image,{autoAlpha:1,duration:.35},start-.18);
     timeline.to(images[index-1],{autoAlpha:0,duration:.35},start-.18);
    }
    timeline.to(image,{scale:1,duration:1.15},start);
   });
   // Keep the final road shot visible before leaving the section.
   timeline.to({hold:0},{hold:1,duration:.15},7.85);
  },element);
  // Earlier chapters can change document height after hydration or font loading.
  // Refresh only on layout changes, never on each scroll frame.
  let refreshFrame=0;
  const observer=new ResizeObserver(()=>{
   cancelAnimationFrame(refreshFrame);
   refreshFrame=requestAnimationFrame(()=>ScrollTrigger.refresh());
  });
  observer.observe(document.body);
  return()=>{observer.disconnect();cancelAnimationFrame(refreshFrame);context.revert();};
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
   <div className="moto-story-backdrop" role="img" aria-label="Secuencia cinematográfica de una moto dual-sport al atardecer: retrato, faro, odómetro, motor, transmisión y carretera.">
    {frames.map(frame=><picture className="moto-cinema-frame" key={frame}>
     <source media="(max-width:767px)" srcSet={`/illustrations/moto-cinema-v2/frame-${frame}-mobile.webp`}/>
     <img src={`/illustrations/moto-cinema-v2/frame-${frame}-4k.webp`} srcSet={`/illustrations/moto-cinema-v2/frame-${frame}-1920.webp 1920w, /illustrations/moto-cinema-v2/frame-${frame}-4k.webp 3840w`} sizes="72vw" width="3840" height="2160" alt="" loading="lazy" decoding="async"/>
    </picture>)}
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

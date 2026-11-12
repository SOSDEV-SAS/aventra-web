'use client';
import {useEffect,useState} from 'react';
import {ArrowUpRight,Menu,Moon,Settings2,Sun,X} from 'lucide-react';

export const chapters=[['inicio','El camino'],['rodadas','Rodadas'],['moto','Tu moto'],['tranquilidad','Tranquilidad'],['comunidad','Comunidad'],['esencia','Esencia']] as const;
export function ExperienceNavigation({night,onNight,onEdit}:{night:boolean;onNight:()=>void;onEdit:()=>void}){
  const [open,setOpen]=useState(false),[overHero,setOverHero]=useState(true),[active,setActive]=useState('inicio');
  useEffect(()=>{
    let frame=0;
    const update=()=>{
      cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
        const hero=document.getElementById('inicio');const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;const onFilm=reduced?(document.getElementById('rodadas')?.getBoundingClientRect().top??0)>100:hero?.dataset.handoffTone!=='paper';const moto=document.getElementById('moto');const motoRect=moto?.getBoundingClientRect();const onMoto=!!moto?.classList.contains('motorcycle-story')&&!!motoRect&&motoRect.top<90&&motoRect.bottom>90;setOverHero((!!hero&&hero.getBoundingClientRect().bottom>100&&onFilm)||onMoto);
        let id='inicio';
        for(const [chapter] of chapters){const element=document.getElementById(chapter);if(element&&element.getBoundingClientRect().top<window.innerHeight*.35)id=chapter;}
        if((document.getElementById('descarga')?.getBoundingClientRect().top??Infinity)<window.innerHeight*.35)id='descarga';
        setActive(id);
      });
    };update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',update);window.removeEventListener('resize',update);};
  },[]);
  useEffect(()=>{if(!open)return;const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[open]);
  return <header className={`site-header ${overHero&&!open?'on-film':''} ${open?'menu-open':''}`}>
    <a className="wordmark" href="#inicio" onClick={()=>setOpen(false)} aria-label="Aventra, el comienzo"><img src="/brand.svg" alt="" width="32" height="32"/><span>Aventra</span></a>
    <nav className="desktop-nav" aria-label="Capítulos">{chapters.map(([id,label])=><a key={id} href={`#${id}`} aria-current={active===id?'location':undefined}>{label}</a>)}</nav>
    <div className="header-actions"><button className="header-icon" onClick={onNight} role="switch" aria-label="Modo nocturno" aria-checked={night}>{night?<Sun size={18}/>:<Moon size={18}/>}</button><a href="#descarga" className="nav-cta">Conoce la app<ArrowUpRight size={16}/></a><button className="header-icon menu-toggle" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="chapter-menu" aria-label={open?'Cerrar menú':'Abrir menú'}>{open?<X/>:<Menu/>}</button></div>
    {open&&<nav id="chapter-menu" className="mobile-nav" aria-label="Todos los capítulos">{[...chapters,['descarga','Lleva Aventra contigo']].map(([id,label],i)=><a key={id} href={`#${id}`} onClick={()=>setOpen(false)}><span>0{i+1}</span>{label}<ArrowUpRight size={17}/></a>)}<button onClick={()=>{setOpen(false);onEdit();}}><Settings2 size={17}/>Personalizar experiencia</button></nav>}
    <button className="desktop-edit" onClick={onEdit} aria-label="Personalizar experiencia"><Settings2 size={16}/></button>
  </header>;
}

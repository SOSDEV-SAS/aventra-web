'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {ArrowDown,ArrowUpRight,ChevronLeft,ChevronRight,Film,Loader2,Pause,Play,Volume2,VolumeX} from 'lucide-react';
import {mobileSource,type RideConfig} from '@/lib/ride';
import {RodadasOpening} from './rodadas-opening';

// Duration of the full blink animation in ms (must match CSS blink-transition keyframe)
const BLINK_MS = 520;

export function ImmersiveHero({config,night,blocked}:{config:RideConfig;night:boolean;blocked:boolean}){
  const section=useRef<HTMLElement>(null),video=useRef<HTMLVideoElement>(null);
  const blinkRef=useRef<HTMLDivElement>(null);
  const [index,setIndex]=useState(0),[small,setSmall]=useState(false),[reduced,setReduced]=useState(false);
  const [paused,setPaused]=useState(false),[muted,setMuted]=useState(true),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
  const [blinking,setBlinking]=useState(false);

  const committedIndex=useRef(0);
  const blinkTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const handoffRange=useRef<HTMLDivElement>(null);
  const [handoffVisible,setHandoffVisible]=useState(false);

  const scenes=useMemo(()=>config.scenes.filter(s=>s.enabled),[config.scenes]);
  const scene=scenes[Math.min(index,scenes.length-1)];
  const source=mobileSource((night&&scene.night)||scene.day,small);
  const isImage=scene.mediaType==='image';

  // Performs a blink then switches to target scene index
  const blinkTo=useCallback((target:number)=>{
    if(target===committedIndex.current)return;
    committedIndex.current=target;
    if(reduced){setIndex(target);return;}
    setBlinking(true);
    if(blinkTimer.current)clearTimeout(blinkTimer.current);
    blinkTimer.current=setTimeout(()=>{
      setIndex(target);
      setBlinking(false);
    },BLINK_MS*0.55); // switch video at peak darkness (55% through)
  },[reduced]);

  useEffect(()=>{
    const mobile=matchMedia('(max-width:767px)'),motion=matchMedia('(prefers-reduced-motion:reduce)');
    const update=()=>{setSmall(mobile.matches);setReduced(motion.matches);if(motion.matches)setPaused(true);};update();
    mobile.addEventListener('change',update);motion.addEventListener('change',update);
    return()=>{mobile.removeEventListener('change',update);motion.removeEventListener('change',update);};
  },[]);

  useEffect(()=>{
    setIndex(i=>Math.min(i,scenes.length-1));
    committedIndex.current=Math.min(committedIndex.current,scenes.length-1);
  },[scenes.length]);

  useEffect(()=>{setReady((video.current?.readyState??0)>=2);setFailed(false);},[source]);

  useEffect(()=>{
    if(!video.current)return;
    video.current.muted=muted;
    if(paused||blocked)video.current.pause();
    else video.current.play().catch(error=>{if(error.name==='NotAllowedError')setPaused(true);});
  },[source,paused,muted,blocked]);

  // Scene selection and the editorial handoff follow native scroll position.
  useEffect(()=>{
    if(reduced||blocked)return;
    let frame=0;
    const update=()=>{
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        const el=section.current,range=handoffRange.current;
        if(!el||!range)return;
        const travel=-el.getBoundingClientRect().top;
        const distance=range.offsetTop;
        const progress=Math.max(0,Math.min(1,(travel-distance)/range.offsetHeight));
        const wash=progress*progress*(3-2*progress);
        el.style.setProperty('--handoff-progress',String(progress));
        el.style.setProperty('--handoff-wash',String(wash));
        el.style.setProperty('--handoff-fade',String(Math.min(1,progress/.22)));
        el.style.setProperty('--handoff-reveal',String(Math.max(0,Math.min(1,(progress-.12)/.35))));
        el.dataset.handoffTone=progress>.55?'paper':'film';
        setHandoffVisible(progress>.08);
        if(travel<0)return;
        const target=Math.min(scenes.length-1,Math.floor(Math.max(0,travel)/Math.max(1,distance)*scenes.length));
        blinkTo(target);
      });
    };
    update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',update);window.removeEventListener('resize',update);if(blinkTimer.current)clearTimeout(blinkTimer.current);};
  },[scenes.length,reduced,blocked,blinkTo]);

  const select=useCallback((next:number)=>{
    if(next>=scenes.length){document.getElementById('rodadas')?.scrollIntoView({behavior:reduced?'auto':'smooth'});return;}
    const i=Math.max(0,next);
    blinkTo(i);
    if(reduced)return;
    const el=section.current;if(!el)return;
    const top=scrollY+el.getBoundingClientRect().top;
    window.scrollTo({top:top+(handoffRange.current?.offsetTop??0)*(i/scenes.length+.015),behavior:'smooth'});
  },[scenes.length,reduced,blinkTo]);

  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{
      if(blocked||!section.current)return;
      const rect=section.current.getBoundingClientRect();if(rect.bottom<innerHeight*.6||rect.top>0)return;
      if((e.target as HTMLElement).closest('button,a,input,textarea,select'))return;
      if(e.key==='ArrowRight'){e.preventDefault();select(index+1);}
      if(e.key==='ArrowLeft'){e.preventDefault();select(index-1);}
    };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  },[blocked,index,select]);

  return <section id="inicio" className="immersive-intro" ref={section} style={{'--scene-count':Math.min(scenes.length,8)} as CSSProperties} aria-label="El camino, recorrido visual de Aventra">
    <div ref={handoffRange} className="handoff-range" aria-hidden="true"/>
    <div id="rodadas" className="rodadas-scroll-target" aria-hidden="true"/>
    <div className={`hero-stage${handoffVisible?' is-handing-off':''}`}>
      <div className="hero-media">
        {isImage?<img className="hero-scene-image" src={source} alt="Ilustración conceptual de Aventra"/>:<video
          key={source}
          ref={video}
          src={source}
          autoPlay
          muted={muted}
          playsInline
          loop
          preload="auto"
          className={ready?'ready':''}
          onCanPlay={()=>setReady(true)}
          onLoadedData={()=>setReady(true)}
          onError={()=>{setFailed(true);setReady(false);}}
        />}
        <div className="hero-shade"/>
        {/* Blink overlay — black curtain that simulates an eye blink between scenes */}
        <div ref={blinkRef} className={`hero-blink${blinking?' blinking':''}`} aria-hidden="true"/>
      </div>
      {!isImage&&failed&&<div className="hero-media-message" role="status"><Film size={18}/><span>No pudimos reproducir este video.</span><button onClick={()=>video.current?.load()}>Reintentar</button></div>}
      {!isImage&&!ready&&!failed&&<div className="hero-loading" role="status"><Loader2 size={15} className="spin"/><span>Preparando el camino…</span></div>}
      <div className="hero-copy" key={scene.id} inert={handoffVisible&&!reduced} aria-hidden={handoffVisible&&!reduced}>
        <p className="eyebrow"><span className="little-line"/>{index===0?config.welcome:scene.name}</p>
        {index===0
          ?<h1>{config.title==='Cada kilómetro cuenta una historia.'?<>Cada kilómetro<br/>cuenta una <em>historia.</em></>:config.title}</h1>
          :<h2 className="scene-heading">{scene.name}{(index!==scenes.length-1||scene.caption!==config.content.rodadasTitle)&&<span className="scene-caption">{scene.caption}</span>}</h2>}
        <div className="hero-bottom-copy">
          <p>{index===0?config.subtitle:'La tranquilidad de seguir avanzando.'}</p>
        </div>
      </div>
      <a href="#rodadas" className="hero-discover" inert={handoffVisible&&!reduced} aria-hidden={handoffVisible&&!reduced}>{config.enterLabel}<span><ArrowDown size={19}/></span></a>
      <aside className="hero-aside"><span className="vertical-label">CONFIANZA PARA SEGUIR AVANZANDO</span><span className="coordinates">EL CAMINO<br/>EMPIEZA CONTIGO.</span></aside>
      <div className="hero-console" inert={handoffVisible&&!reduced} aria-hidden={handoffVisible&&!reduced}>
        <div className="scene-count"><span>{String(index+1).padStart(2,'0')}</span><i/><span>{String(scenes.length).padStart(2,'0')}</span></div>
        <div className="video-dots" aria-label="Escenas del recorrido">
          {scenes.map((s,i)=><button key={s.id} onClick={()=>select(i)} className={index===i?'selected':''} aria-label={`Ver ${s.name}`} aria-current={i===index?'step':undefined}/>)}
        </div>
        <div className="video-controls">
          <button disabled={isImage} onClick={()=>setMuted(!muted)} aria-label={muted?'Activar sonido del video':'Silenciar video'}>{muted?<VolumeX size={17}/>:<Volume2 size={17}/>}</button>
          <button disabled={isImage} onClick={()=>setPaused(!paused)} aria-label={paused?'Reproducir video':'Pausar video'}>{paused?<Play size={16}/>:<Pause size={16}/>}</button>
          <span className="control-divider"/>
          <button disabled={index===0} onClick={()=>select(index-1)} aria-label="Escena anterior"><ChevronLeft size={21}/></button>
          <button onClick={()=>select(index+1)} aria-label="Escena siguiente"><ChevronRight size={21}/></button>
        </div>
      </div>
      <div className="handoff-wash" aria-hidden="true"/>
      <div className="journey-handoff" inert={!handoffVisible&&!reduced} aria-hidden={!handoffVisible&&!reduced}><RodadasOpening content={config.content}/></div>
      <a href="#rodadas" className="hero-next">SIGUIENTE CAPÍTULO<span>Compartir el camino<ArrowUpRight size={15}/></span></a>
    </div>
  </section>;
}

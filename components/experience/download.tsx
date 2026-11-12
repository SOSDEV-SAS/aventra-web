'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {ArrowUpRight, Download, Loader2, RotateCcw} from 'lucide-react';
import {checkDownloadAvailability, RELEASE_APK_PATH, type DownloadAvailability} from '@/lib/release';
import downloadSettings from '@/config/downloads.json';

type Availability = DownloadAvailability | {status:'loading'};

export function DownloadSection({title,intro}:{title:string;intro:string}) {
  const [availability,setAvailability] = useState<Availability>({status:downloadSettings.enabled?'loading':'disabled'});
  const inFlight = useRef(false);
  const mounted = useRef(false);
  const refresh = useCallback(async()=>{
    if(inFlight.current)return;
    inFlight.current=true;
    setAvailability({status:'loading'});
    const next=await checkDownloadAvailability(downloadSettings.enabled);
    if(mounted.current)setAvailability(next);
    inFlight.current=false;
  },[]);

  useEffect(()=>{
    mounted.current=true;
    void refresh();
    return()=>{mounted.current=false;};
  },[refresh]);

  const release=downloadSettings.enabled&&availability.status==='ready'?availability.release:null;
  return <section id="descarga" className="download-section" aria-labelledby="download-title">
    <div className="download-copy">
      <span className="eyebrow">07 / Lleva Aventra contigo</span>
      <h2 id="download-title">{title}</h2>
      <p>{intro}</p>
      <a href="#inicio" className="button-secondary">Volver al recorrido <ArrowUpRight size={17}/></a>
    </div>
    <div className="download-card">
      <Download size={30} aria-hidden="true"/>
      <p className="eyebrow">Versión preliminar para Android</p>
      <h3>Tu próximo camino,<br/>con Aventra.</h3>
      <div className="download-status" role={availability.status==='error'?'alert':'status'} aria-live="polite">
        {availability.status==='loading'&&<><Loader2 className="spin" size={16} aria-hidden="true"/>Consultando la última versión…</>}
        {availability.status==='disabled'&&'La descarga de APK está deshabilitada.'}
        {availability.status==='preparing'&&'La descarga no está disponible en esta página.'}
        {availability.status==='error'&&availability.message}
        {availability.status==='ready'&&'Descarga directa · Sin intermediarios'}
      </div>
      {release?<>
        <a className="button-primary" href={RELEASE_APK_PATH} download="aventra.apk">Descargar Aventra para Android <ArrowUpRight size={17}/></a>
        <dl className="release-details">
          <div><dt>Versión</dt><dd>v{release.version} · compilación {release.versionCode}</dd></div>
          <div><dt>Tamaño</dt><dd>{(release.sizeBytes/1048576).toLocaleString('es-CO',{maximumFractionDigits:1})} MB</dd></div>
          <div><dt>Publicación</dt><dd>{new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeZone:'UTC'}).format(new Date(release.publishedAt))}</dd></div>
        </dl>
      </>:<button className="button-primary" disabled>{availability.status==='loading'?'Comprobando disponibilidad…':'Descarga no disponible'}</button>}
      {(availability.status==='error'||availability.status==='preparing')&&<button className="button-secondary" onClick={()=>void refresh()}><RotateCcw size={15}/>Volver a consultar</button>}
    </div>
  </section>;
}

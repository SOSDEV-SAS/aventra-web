'use client';
import {useCallback,useEffect,useState} from 'react';
import {ArrowUpRight,Settings2} from 'lucide-react';
import {defaultConfig,normalizeConfig,type RideConfig} from '@/lib/ride';
import {ExperienceNavigation} from '@/components/experience/navigation';
import {ImmersiveHero} from '@/components/experience/hero';
import {EditorialChapters} from '@/components/experience/chapters';
import {ExperienceEditor} from '@/components/experience/editor';
import {DownloadSection} from '@/components/experience/download';
import {useEditorialMotion} from '@/components/experience/use-editorial-motion';

export default function RideStudio(){
 const [config,setConfig]=useState<RideConfig>(()=>structuredClone(defaultConfig));
 const [revision,setRevision]=useState<string|null>(null),[canEdit,setCanEdit]=useState(false);
 const [panel,setPanel]=useState(false),[night,setNight]=useState(false),[loadError,setLoadError]=useState('');
 useEditorialMotion();
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/api/ride',{signal:controller.signal}).then(async response=>{
   if(!response.ok)throw new Error('No pudimos cargar tu configuración. Tus datos guardados se conservan; recarga la página para volver a intentarlo.');
   const data=await response.json() as {config:unknown;revision:string|null;canEdit:boolean};
   if(data.config)setConfig(normalizeConfig(data.config));setRevision(data.revision);setCanEdit(data.canEdit);
  }).catch(error=>{if(error.name!=='AbortError')setLoadError(error.message);});
  return()=>controller.abort();
 },[]);
 const onSaved=useCallback((next:RideConfig,nextRevision:string)=>{setConfig(next);setRevision(nextRevision);},[]);
 return <div className={`aventra-experience ${night?'theme-night':''}`}>
  <div inert={panel} aria-hidden={panel}>
   <a className="skip-link" href="#rodadas">Saltar al contenido de Aventra</a>
   <ExperienceNavigation night={night} onNight={()=>setNight(!night)} onEdit={()=>setPanel(true)}/>
   <main>
    <ImmersiveHero config={config} night={night} blocked={panel}/>
    <EditorialChapters content={config.content} blocked={panel}/>
    <DownloadSection title={config.content.downloadTitle} intro={config.content.downloadIntro}/>
   </main>
   <footer className="site-footer"><a className="wordmark" href="#inicio"><img src="/brand.svg" width="30" height="30" alt=""/><span>Aventra</span></a><p className="footer-outro">{config.outroTitle}<span>{config.outroText}</span></p><div><a href="#inicio">Volver al comienzo<ArrowUpRight size={14}/></a><button onClick={()=>setPanel(true)}><Settings2 size={14}/>Personalizar experiencia</button></div><small>Ilustraciones creadas para Aventra.</small><small>Aventra está en versión preliminar para Android.</small><nav className="legal-links" aria-label="Información legal"><a href="/terminos">Términos</a><a href="/privacidad">Privacidad</a><a href="/derechos">Derechos de autor</a></nav><small>© 2026 Santiago Osorio Soto · Sosdev</small></footer>
  </div>
  <ExperienceEditor panel={panel} setPanel={setPanel} config={config} revision={revision} canEdit={canEdit} onSaved={onSaved} loadError={loadError}/>
 </div>;
}

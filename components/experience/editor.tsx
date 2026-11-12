'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUp,ArrowDown,Check,Film,Layers3,Loader2,LockKeyhole,Plus,RotateCcw,Settings2,Upload,X} from 'lucide-react';
import {defaultConfig,validateConfig,type RideConfig,type Scene} from '@/lib/ride';
import {contentLabels} from './editor-labels';
const pad=(n:number)=>String(n).padStart(2,'0');
type Tab='scenes'|'texts'|'content';
type Props={panel:boolean;setPanel:(value:boolean)=>void;config:RideConfig;revision:string|null;canEdit:boolean;onSaved:(config:RideConfig,revision:string)=>void;loadError:string};
export function ExperienceEditor({panel,setPanel,config,revision,canEdit,onSaved,loadError}:Props){
 const [localPreview,setLocalPreview]=useState(false);
 useEffect(()=>setLocalPreview(['localhost','127.0.0.1','[::1]'].includes(location.hostname)),[]);
 const [draft,setDraft]=useState(()=>structuredClone(config));
 const [tab,setTab]=useState<Tab>('scenes');
 const [saving,setSaving]=useState(false),[uploading,setUploading]=useState(false),[progress,setProgress]=useState(0);
 const [message,setMessage]=useState(''),[error,setError]=useState(''),[newTitle,setNewTitle]=useState('');
 const [dayFile,setDayFile]=useState<File|null>(null),[nightFile,setNightFile]=useState<File|null>(null);
 const panelRef=useRef<HTMLElement>(null);
 const dirty=JSON.stringify(config)!==JSON.stringify(draft);
  useEffect(()=>{if(dirty&&message.startsWith('Cambios guardados'))setMessage('');},[dirty,message]);
 useEffect(()=>setDraft(structuredClone(config)),[config]);
 useEffect(()=>{if(loadError)setError(loadError);},[loadError]);
 useEffect(()=>{
  if(!panel)return;
  const previous=document.activeElement as HTMLElement,priorOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
  const onKey=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){setPanel(false);return;}if(e.key!=='Tab')return;
   const list=Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a,input:not(:disabled),textarea,select')||[]).filter(el=>el.getClientRects().length);
   const first=list[0],last=list[list.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
   if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
  };
  window.addEventListener('keydown',onKey);
  return()=>{document.body.style.overflow=priorOverflow;window.removeEventListener('keydown',onKey);previous?.focus();};
 },[panel,setPanel]);
  const editScene=(id:string,patch:Partial<Scene>)=>setDraft(d=>({...d,scenes:d.scenes.map(s=>s.id===id?{...s,...patch}:s)}));
  const move=(position:number,delta:number)=>setDraft(d=>{
    const list=[...d.scenes]; const destination=position+delta;
    if(destination<0||destination>=list.length)return d;
    [list[position],list[destination]]=[list[destination],list[position]];
    return {...d,scenes:list};
  });
  async function save() {
    setError('');setMessage('');setSaving(true);
    try {
      const value=validateConfig(draft);
      const result=await fetch('/api/ride',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({config:value,revision})});
      const data=await result.json() as {revision:string;error?:string};
      if(!result.ok)throw new Error(data.error||'No se pudieron guardar los cambios.');
      setDraft(structuredClone(value));onSaved(value,data.revision);setMessage('Cambios guardados. Tu recorrido está listo.');
    }catch(e){setError(e instanceof Error?e.message:'No se pudo guardar.');}
    finally{setSaving(false);}
  }
  function upload(file:File):Promise<string> {
    if(!['video/mp4','video/webm','video/quicktime'].includes(file.type))return Promise.reject(new Error('Usa un archivo MP4, WebM o MOV.'));
    if(!file.size||file.size>90*1024*1024)return Promise.reject(new Error('Cada video debe pesar entre 1 byte y 90 MB.'));
    return new Promise((resolve,reject)=>{
      const xhr=new XMLHttpRequest();xhr.open('POST','/api/media');
      xhr.setRequestHeader('Content-Type',file.type);xhr.setRequestHeader('X-Filename',encodeURIComponent(file.name));xhr.timeout=300000;
      xhr.upload.onprogress=e=>{if(e.lengthComputable)setProgress(Math.round(e.loaded/e.total*100));};
      xhr.onload=()=>{try{const data=JSON.parse(xhr.responseText);xhr.status>=200&&xhr.status<300?resolve(data.url):reject(new Error(data.error||'No se pudo subir el video.'));}catch{reject(new Error('La subida falló. Intenta con un video más pequeño.'));}};
      xhr.onerror=()=>reject(new Error('Se interrumpió la conexión. Vuelve a intentarlo.'));xhr.ontimeout=()=>reject(new Error('La subida tardó demasiado. Vuelve a intentarlo.'));xhr.send(file);
    });
  }
  async function addVideo(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();if(!dayFile)return;
    const form=e.currentTarget;
    setUploading(true);setError('');setMessage('');setProgress(0);
    try {
      const day=await upload(dayFile);const night=nightFile?await upload(nightFile):'';
      const s:Scene={id:crypto.randomUUID(),name:(newTitle.trim()||dayFile.name.replace(/\.[^.]+$/,'')).slice(0,80),caption:'',day,night,builtIn:false,mediaType:'video',enabled:true};
      setDraft(d=>({...d,scenes:[...d.scenes,s]}));setDayFile(null);setNightFile(null);setNewTitle('');
      form.reset();setMessage('Video añadido a la biblioteca. Guarda los cambios para incluirlo en tu recorrido.');
    }catch(e){setError(e instanceof Error?e.message:'No se pudo añadir el video.');}
    finally{setUploading(false);}
  }

return <>
    {panel&&<div className="editor-overlay"><button className="editor-backdrop" aria-label="Cerrar editor" onClick={()=>setPanel(false)}/><aside ref={panelRef} className="editor" role="dialog" aria-modal="true" aria-labelledby="editor-title">
      <header className="editor-header"><div><span className="eyebrow">AVENTRA / ESTUDIO</span><h2 id="editor-title">Tu próximo capítulo.</h2></div><button className="icon-button" onClick={()=>setPanel(false)} aria-label="Cerrar editor"><X size={22}/></button></header>
      <p className="editor-intro">Personaliza las escenas y los textos de Aventra. Añade únicamente videos que puedas utilizar.</p>
      <div className="editor-tabs" role="tablist" aria-label="Configuración"><button role="tab" aria-selected={tab==='scenes'} onClick={()=>setTab('scenes')}><Layers3 size={16}/>Escenas <span>{draft.scenes.length}</span></button><button role="tab" aria-selected={tab==='texts'} onClick={()=>setTab('texts')}><Settings2 size={16}/>Textos</button><button role="tab" aria-selected={tab==='content'} onClick={()=>setTab('content')}>Capítulos</button></div>
      <div className="editor-content">
        {!canEdit&&<div className="signin-note"><LockKeyhole size={18}/><div><strong>Guarda tu propio recorrido</strong><p>En desarrollo puedes activar una sesión local simulada. La edición publicada requiere un acceso configurado por el responsable.</p>{localPreview&&<a className="dark-button" href="/preview-signin?return_to=/" target="_top">Activar edición local</a>}</div></div>}
        {tab==='scenes'?<>
          <div className="section-label"><h3>Tu biblioteca</h3><span>{draft.scenes.filter(s=>s.enabled).length} en el recorrido</span></div>
          <p className="helper">Ordena las escenas y elige cuáles mostrar. Puedes ocultar las escenas de Aventra sin retirarlas de la biblioteca.</p>
          <div className="scene-list">{draft.scenes.map((s,i)=><article className={`scene-card ${!s.enabled?'disabled':''}`} key={s.id}>
            <div className="scene-preview">{s.builtIn?<img src={s.day} alt=""/>:<Film size={24}/>}<span>{pad(i+1)}</span></div>
            <div className="scene-details"><input aria-label={`Nombre de ${s.name}`} maxLength={80} value={s.name} onChange={e=>editScene(s.id,{name:e.target.value})}/><span className="origin-badge">{s.builtIn?<><LockKeyhole size={10}/>Escena Aventra</>:<><Film size={10}/>Tu video</>}{s.mediaType==='image'?' · Ilustración':s.night?' · Día + noche':' · Un video'}</span><input className="caption-input" aria-label={`Texto de ${s.name}`} maxLength={300} value={s.caption} placeholder="Añade una frase…" onChange={e=>editScene(s.id,{caption:e.target.value})}/></div>
            <div className="scene-actions"><button aria-label={`Subir ${s.name}`} disabled={i===0} onClick={()=>move(i,-1)}><ArrowUp size={14}/></button><button aria-label={`Bajar ${s.name}`} disabled={i===draft.scenes.length-1} onClick={()=>move(i,1)}><ArrowDown size={14}/></button><input type="checkbox" checked={s.enabled} aria-label={`Mostrar ${s.name}`} onChange={e=>editScene(s.id,{enabled:e.target.checked})}/></div>
          </article>)}</div>
          <form className="upload-form" onSubmit={addVideo}><div className="upload-heading"><Plus size={19}/><h3>Añadir una nueva escena</h3></div><p>Se suma a tu biblioteca de Aventra.</p>
            <label className="field">Nombre de la escena<input value={newTitle} onChange={e=>setNewTitle(e.target.value)} maxLength={80} placeholder="Ej. Mi viaje a la costa"/></label>
            <label className={`file-field ${dayFile?'has-file':''}`}><Upload size={24}/><strong>{dayFile?dayFile.name:'Elige tu video'}</strong><span>MP4, WebM o MOV · hasta 90 MB</span><input type="file" name="day" aria-label="Video principal" accept="video/mp4,video/webm,video/quicktime" required onChange={e=>setDayFile(e.target.files?.[0]||null)} disabled={!canEdit||uploading}/></label>
            <label className="field night-file">Versión nocturna <span>Opcional</span><input type="file" name="night" aria-label="Video nocturno opcional" accept="video/mp4,video/webm,video/quicktime" onChange={e=>setNightFile(e.target.files?.[0]||null)} disabled={!canEdit||uploading}/></label>
            <button className="dark-button" type="submit" disabled={!canEdit||!dayFile||uploading||draft.scenes.length>=100}>{uploading?<><Loader2 className="spin" size={17}/>Subiendo {progress}%</>:<><Plus size={16}/>Añadir a la biblioteca</>}</button>
            <p className="upload-tip">Sin versión nocturna, se muestra el mismo video en ambos modos. Para mayor compatibilidad, usa MP4 con H.264.</p>
          </form>
        </>:tab==='content'?<div className="text-fields">{contentLabels.map(([key,label])=><label className="field" key={key}>{label}<textarea maxLength={key.endsWith('Title')?200:1200} value={draft.content[key]} onChange={e=>setDraft(d=>({...d,content:{...d.content,[key]:e.target.value}}))}/></label>)}</div>:<div className="text-fields"><span className="section-label"><h3>La voz de tu recorrido</h3></span>{([
          ['title','Título principal','Cada kilómetro cuenta una historia.'],['subtitle','Frase de apertura','Que lo único pendiente sea el próximo destino.'],['welcome','Mensaje de bienvenida','Tu moto. Tu historia. Tu camino.'],['enterLabel','Botón de entrada','Empieza el recorrido'],['outroTitle','Título del cierre','Confianza para seguir avanzando.'],['outroText','Texto del cierre','Tu historia…'],
        ] as const).map(([key,label,placeholder])=><label className="field" key={key}>{label}{key==='outroText'?<textarea value={draft[key]} maxLength={1200} onChange={e=>setDraft(d=>({...d,[key]:e.target.value}))}/>:<input placeholder={placeholder} value={draft[key]} maxLength={200} onChange={e=>setDraft(d=>({...d,[key]:e.target.value}))}/>}</label>)}<button className="reset-button" onClick={()=>setDraft(d=>({...defaultConfig,scenes:d.scenes}))}><RotateCcw size={15}/>Restaurar textos predeterminados</button></div>}
      </div>
      <footer className="editor-footer">{error&&<p className="feedback error" role="alert">{error}</p>}{message&&<p className="feedback success" role="status"><Check size={16}/>{message}</p>}<div className="save-row"><span>{dirty?<><i/>Cambios sin guardar</>:<><Check size={14}/>Todo guardado</>}</span><button className="dark-button" onClick={save} disabled={!canEdit||saving||uploading||!dirty}>{saving?<Loader2 className="spin" size={15}/>:<Check size={16}/>}Guardar cambios</button></div></footer>
    </aside></div>}
</>;
}

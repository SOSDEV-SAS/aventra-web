// Render the read-only public site from the built Worker, never a development server.
import {spawn} from 'node:child_process';
import {cp,mkdir,writeFile} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
const port=Number(process.env.AVENTRA_EXPORT_PORT || 5192);
const origin=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['--import','./scripts/environment.mjs','./node_modules/wrangler/bin/wrangler.js','dev','--config','dist/server/wrangler.json','--local','--ip','127.0.0.1','--port',String(port),'--inspector-port','0'],{stdio:['ignore','pipe','pipe'],env:process.env});
let errors='';
server.stderr.on('data',chunk=>{errors=(errors+chunk).slice(-6000)});
server.stdout.resume();
try{
 let ready=false;
 for(let attempt=0;attempt<60;attempt++){
  if(server.exitCode!==null)throw new Error(`Render server exited: ${errors}`);
  try{const response=await fetch(origin+'/api/ride');if(response.ok){ready=true;break}}catch{}
  await delay(500);
 }
 if(!ready)throw new Error('Render server did not become ready. '+errors);
 await mkdir('out',{recursive:true});
 await cp('dist/client','out',{recursive:true});
 for(const route of ['/','/terminos','/privacidad','/derechos']){
  const response=await fetch(origin+route);
  if(!response.ok)throw new Error(`Cannot render ${route}: ${response.status}`);
  const html=await response.text();
  if(!html.includes('Aventra')||html.includes('/@vite/client'))throw new Error('Unexpected development or incomplete HTML');
  const directory=route==='/'?'out':`out${route}`;
  await mkdir(directory,{recursive:true});
  await writeFile(`${directory}/index.html`,html);
 }
 console.log('Read-only public site exported to out/.');
}finally{server.kill();}

import {ArrowDown,ArrowUpRight} from 'lucide-react';
import type {EditorialContent} from '@/lib/aventra-content';

export function RodadasOpening({content}:{content:EditorialContent}){
 return <div className="rodadas-opening">
  <div className="section-top"><p className="chapter-label"><span>02</span><i/>RODADAS</p><span className="section-aside">HAY CAMINOS QUE SE DISFRUTAN EN COMPAÑÍA.</span></div>
  <div className="split-intro"><h2 className="editorial-heading">{content.rodadasTitle}</h2><div className="intro-paragraph"><p>{content.rodadasIntro}</p><a className="inline-link" href="#descarga">Conoce Rodadas en la app<ArrowUpRight size={17}/></a></div></div>
  <a href="#rodadas-detalles" className="handoff-continue">Descubre cómo compartir el camino<ArrowDown size={18}/></a>
 </div>;
}

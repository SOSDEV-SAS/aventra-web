'use client';
import {useEffect} from 'react';
export function useEditorialMotion(){
 useEffect(()=>{
  const motion=matchMedia('(prefers-reduced-motion:reduce)');
  const elements=[...document.querySelectorAll<HTMLElement>('.reveal')];
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}},{threshold:.12});
  for(const el of elements)observer.observe(el);
  const updateMotion=()=>{document.documentElement.classList.toggle('motion-on',!motion.matches);if(motion.matches)for(const el of elements)el.classList.add('is-visible');};updateMotion();motion.addEventListener('change',updateMotion);
  const cards=[...document.querySelectorAll<HTMLElement>('[data-stack-card]')];let frame=0;
  const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   cards.forEach((card,i)=>{const next=cards[i+1];const progress=motion.matches||innerWidth<768||!next?0:Math.max(0,Math.min(1,(innerHeight*.9-next.getBoundingClientRect().top)/(innerHeight*.9-110)));card.style.setProperty('--stack-progress',String(progress));});
  });};window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
  return()=>{observer.disconnect();cancelAnimationFrame(frame);motion.removeEventListener('change',updateMotion);window.removeEventListener('scroll',update);window.removeEventListener('resize',update);document.documentElement.classList.remove('motion-on');};
 },[]);
}

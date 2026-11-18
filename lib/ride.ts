import { approvedContent, type EditorialContent } from './aventra-content.ts';

export type Scene = {
  id: string; name: string; day: string; night: string;
  caption: string; enabled: boolean; builtIn: boolean; mediaType: 'image'|'video';
};
export type RideConfig = {
  schemaVersion: 3;
  title: string; subtitle: string; welcome: string; enterLabel: string;
  outroTitle: string; outroText: string; scenes: Scene[];
  content: EditorialContent;
};
const aventraCatalog = Object.freeze([
 ['camino','El comienzo','banner','Toda buena historia empieza con un viaje.'],
 ['identidad','La ciudad','ciudad','Sin prisa. Solo tú y el camino.'],
 ['cuidados','La carretera','carretera','La rutina queda atrás. El camino continúa.'],
 ['compartir','El pueblo','pueblo','Cada parada también cuenta una historia.'],
 ['historia','El encuentro','encuentro','El camino también se comparte.'],
].map(([id,name,file,caption])=>Object.freeze({id,name,day:`/videos/${file}.mp4`,night:'',caption,enabled:true,builtIn:true,mediaType:'video' as const})));
const aventraDefaults = Object.freeze({
  title: 'Cada kilómetro cuenta una historia.',
  subtitle: 'Que lo único pendiente sea el próximo destino.',
  welcome: 'Tu moto. Tu historia. Tu camino.',
  enterLabel: 'Empieza el recorrido',
  outroTitle: 'Confianza para seguir avanzando.',
  outroText: 'Tu moto es mucho más que un medio de transporte. Aventra reúne su historia, sus cuidados y las personas con quienes compartes el camino para acompañarte antes, durante y después de cada recorrido.',
});
export const defaultConfig: RideConfig = {
  schemaVersion: 3,
  ...aventraDefaults,
  content: { ...approvedContent },
  scenes: aventraCatalog.map(scene => ({ ...scene })),
};

function validText(value: unknown, label: string, maximum: number, allowEmpty = false): string {
  if (typeof value !== 'string' || (!allowEmpty && !value.trim()) || value.length > maximum) throw new Error(`Revisa el campo ${label}.`);
  return value;
}

function editorialContent(value: unknown): EditorialContent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('El contenido editorial no es válido.');
  const object = value as Record<string, unknown>;
  const keys = Object.keys(approvedContent) as (keyof EditorialContent)[];
  if (Object.keys(object).length !== keys.length || keys.some(key => !Object.hasOwn(object, key))) throw new Error('El contenido editorial debe incluir todos sus campos.');
  return Object.fromEntries(keys.map(key => [key, validText(object[key], key, key.endsWith('Title') ? 200 : 1200)])) as EditorialContent;
}

/** Validate the current Aventra configuration. */
export function normalizeConfig(input: unknown): RideConfig {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('La configuración no es válida.');
  const obj = input as Record<string, unknown>;
  if (obj.schemaVersion !== 3) throw new Error('Esta versión de configuración no es compatible.');
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(aventraDefaults) as (keyof typeof aventraDefaults)[]) {
    const value = validText(obj[key], key, key === 'outroText' ? 1200 : 200);
    result[key] = value;
  }
  const content = editorialContent(obj.content);
  if (!Array.isArray(obj.scenes) || obj.scenes.length < 5 || obj.scenes.length > 100) throw new Error('El recorrido admite hasta 100 escenas.');
  const ids = new Set<string>();
  const scenes = obj.scenes.map((item: unknown) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Escena no válida.');
    const s = item as Record<string, unknown>;
    if (typeof s.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(s.id) || ids.has(s.id)) throw new Error('Identificador de escena no válido o repetido.');
    ids.add(s.id);
    const brand = aventraCatalog.find(o => o.id === s.id);
    const validVideo = (url: unknown, optional: boolean) => typeof url === 'string' && ((optional && url === '') || /^\/api\/media\/[a-f0-9-]{36}\.(mp4|webm|mov)$/.test(url));
    if (brand ? (s.day !== brand.day || s.night !== '' || s.builtIn !== true || s.mediaType !== brand.mediaType) : (!validVideo(s.day, false) || !validVideo(s.night, true) || s.builtIn !== false || s.mediaType !== 'video')) throw new Error('El recurso de la escena no es válido.');
    if (typeof s.name !== 'string' || !s.name.trim() || s.name.length > 80 || typeof s.caption !== 'string' || s.caption.length > 300 || typeof s.enabled !== 'boolean') throw new Error('Revisa el nombre y el texto de la escena.');
    return {id:s.id, name:s.name, caption:s.caption, day:s.day as string, night:s.night as string, enabled:s.enabled, builtIn:!!brand,mediaType:'video' as const};
  });
  if (aventraCatalog.some(o => !ids.has(o.id))) throw new Error('Conserva las escenas de Aventra en la biblioteca; puedes ocultarlas.');
  if (!scenes.some(s => s.enabled)) throw new Error('Activa al menos una escena.');
  return {schemaVersion: 3, ...result, content, scenes} as RideConfig;
}

export function validateConfig(input: unknown): RideConfig {
  return normalizeConfig(input);
}

export function mobileSource(source: string, small: boolean) {
  return small && /^\/videos\/(banner|ciudad|carretera|pueblo|encuentro)\.mp4$/.test(source) ? source.replace('/videos/', '/videos/mobile/') : source;
}

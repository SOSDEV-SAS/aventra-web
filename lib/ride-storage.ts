import { env } from "cloudflare:workers";
import { getAventraUser } from "../app/identity";

export const MAX_VIDEO_BYTES = 90 * 1024 * 1024;
export const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
export const MEDIA_ID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\.(mp4|webm|mov)$/;

export class StorageError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

export function failure(error: unknown) {
  if (error instanceof StorageError) return json({ error: error.message }, error.status);
  console.error("Ride storage request failed", error);
  return json({ error: "No se pudo completar la operación. Inténtelo de nuevo." }, 500);
}

export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new StorageError(403, "Esta operación solo está disponible desde este sitio.");
  }
}

export async function userStorage() {
  const user = await getAventraUser();
  if (!user) throw new StorageError(401, "Inicie sesión para guardar y subir videos.");
  if (!env.BUCKET) throw new StorageError(503, "El almacenamiento de videos todavía no está disponible.");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(user.userId));
  const scope = [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, "0")).join("");
  return { bucket: env.BUCKET, prefix: `users/${scope}/` };
}

export async function limitedJson(request: Request, limit = 512 * 1024): Promise<unknown> {
  if (!request.body) throw new StorageError(400, "Falta la configuración.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > limit) {
      await reader.cancel();
      throw new StorageError(413, "La configuración supera el tamaño permitido.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new StorageError(400, "La configuración no contiene JSON válido."); }
}

export function parseRange(header: string, size: number): { offset: number; length: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2]) || size <= 0) return null;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return null;
    const length = Math.min(suffix, size);
    return { offset: size - length, length };
  }
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) return null;
  return { offset: start, length: Math.min(end, size - 1) - start + 1 };
}

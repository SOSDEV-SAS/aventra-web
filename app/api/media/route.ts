import { checkOrigin, failure, json, MAX_VIDEO_BYTES, StorageError, userStorage, VIDEO_TYPES } from "../../../lib/ride-storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { bucket, prefix } = await userStorage();
    const type = request.headers.get("content-type")?.split(";", 1)[0].toLowerCase() ?? "";
    if (!VIDEO_TYPES[type]) throw new StorageError(415, "Use un video MP4, WebM o MOV.");
    const lengthHeader = request.headers.get("content-length");
    if (lengthHeader === null) throw new StorageError(411, "No se pudo determinar el tamaño del video.");
    const size = Number(lengthHeader);
    if (!Number.isSafeInteger(size) || size <= 0) throw new StorageError(400, "El archivo está vacío o su tamaño no es válido.");
    if (size > MAX_VIDEO_BYTES) throw new StorageError(413, "Cada video puede ocupar hasta 90 MB.");
    if (!request.body) throw new StorageError(400, "Falta el archivo de video.");
    let filename = "video." + VIDEO_TYPES[type];
    const rawName = request.headers.get("x-filename");
    if (rawName) {
      try { filename = decodeURIComponent(rawName).replace(/[\x00-\x1f\x7f/\\]/g, "_").slice(0, 200) || filename; }
      catch { throw new StorageError(400, "El nombre del archivo no es válido."); }
    }
    const id = crypto.randomUUID() + "." + VIDEO_TYPES[type];
    await bucket.put(prefix + "media/" + id, request.body, {
      httpMetadata: { contentType: type },
      customMetadata: { filename, uploadedAt: new Date().toISOString() },
    });
    return json({ url: "/api/media/" + id, filename, size, type }, 201);
  } catch (error) { return failure(error); }
}

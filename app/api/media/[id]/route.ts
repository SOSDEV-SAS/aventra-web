import { failure, MEDIA_ID, parseRange, StorageError, userStorage, VIDEO_TYPES } from "../../../../lib/ride-storage";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

async function serve(request: Request, context: Context, headOnly = false) {
  try {
    const { id } = await context.params;
    if (!MEDIA_ID.test(id)) throw new StorageError(404, "Video no encontrado.");
    const { bucket, prefix } = await userStorage();
    const key = prefix + "media/" + id;
    const metadata = await bucket.head(key);
    if (!metadata) throw new StorageError(404, "Video no encontrado.");
    const extension = id.split(".").pop();
    const type = Object.entries(VIDEO_TYPES).find(([, ext]) => ext === extension)?.[0] ?? "video/mp4";
    const headers = new Headers({
      "Content-Type": type,
      "Content-Length": String(metadata.size),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
      "ETag": metadata.httpEtag,
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline; filename*=UTF-8''" + encodeURIComponent(metadata.customMetadata?.filename ?? id),
    });
    if (request.headers.get("if-none-match") === metadata.httpEtag) return new Response(null, { status: 304, headers });
    const rangeHeader = request.headers.get("range");
    const range = rangeHeader ? parseRange(rangeHeader, metadata.size) : undefined;
    if (rangeHeader && !range) {
      headers.set("Content-Range", `bytes */${metadata.size}`);
      headers.set("Content-Length", "0");
      return new Response(null, { status: 416, headers });
    }
    if (range) {
      headers.set("Content-Length", String(range.length));
      headers.set("Content-Range", `bytes ${range.offset}-${range.offset + range.length - 1}/${metadata.size}`);
    }
    if (headOnly) return new Response(null, { status: range ? 206 : 200, headers });
    const object = await bucket.get(key, range ? { range } : undefined);
    if (!object) throw new StorageError(404, "Video no encontrado.");
    return new Response(object.body, { status: range ? 206 : 200, headers });
  } catch (error) { return failure(error); }
}

export async function GET(request: Request, context: Context) { return serve(request, context); }
export async function HEAD(request: Request, context: Context) { return serve(request, context, true); }

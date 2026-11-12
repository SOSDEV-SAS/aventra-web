import { getAventraUser } from "../../identity";
import { normalizeConfig, validateConfig } from "../../../lib/ride";
import { checkOrigin, failure, json, limitedJson, StorageError, userStorage } from "../../../lib/ride-storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!await getAventraUser()) return json({ config: null, revision: null, canEdit: false });
    const { bucket, prefix } = await userStorage();
    const object = await bucket.get(prefix + "config.json");
    return json({ config: object ? normalizeConfig(await object.json()) : null, revision: object?.etag ?? null, canEdit: true });
  } catch (error) { return failure(error); }
}

export async function PUT(request: Request) {
  try {
    checkOrigin(request);
    const { bucket, prefix } = await userStorage();
    const body = await limitedJson(request);
    if (!body || typeof body !== "object" || !("config" in body) || !("revision" in body)) {
      throw new StorageError(400, "Falta la configuración o su versión.");
    }
    const { config: candidate, revision } = body as { config: unknown; revision: unknown };
    if (revision !== null && (typeof revision !== "string" || !/^[A-Za-z0-9-]{1,100}$/.test(revision))) {
      throw new StorageError(400, "La versión de la configuración no es válida.");
    }
    let config;
    try { config = validateConfig(candidate); }
    catch (error) { throw new StorageError(400, error instanceof Error ? error.message : "Configuración no válida."); }
    const result = await bucket.put(prefix + "config.json", JSON.stringify(config), {
      httpMetadata: { contentType: "application/json" },
      onlyIf: revision === null ? { etagDoesNotMatch: "*" } : { etagMatches: revision as string },
    });
    if (!result) throw new StorageError(409, "La configuración cambió en otra pestaña. Recargue antes de volver a guardar.");
    return json({ revision: result.etag });
  } catch (error) { return failure(error); }
}

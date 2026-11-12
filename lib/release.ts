/** Same-origin Aventra Android release contract. */
export type Release = {
  version: string;
  versionCode: number;
  sizeBytes: number;
  publishedAt: string;
  sha256: string;
};

export const RELEASE_MANIFEST_PATH = '/downloads/latest/release.json';
export const RELEASE_APK_PATH = '/downloads/latest/aventra.apk';

export function parseRelease(data: unknown): Release {
  if (!data || typeof data !== 'object') throw new Error('El manifiesto de descarga no es válido.');
  const r = data as Record<string, unknown>;
  if (
    r.schemaVersion !== 1 ||
    typeof r.version !== 'string' ||
    !/^[0-9]+\.[0-9]+\.[0-9]+(?:-[a-zA-Z0-9.-]+)?$/.test(r.version) ||
    !Number.isSafeInteger(r.versionCode) || Number(r.versionCode) < 1 ||
    !Number.isSafeInteger(r.sizeBytes) || Number(r.sizeBytes) < 1 ||
    typeof r.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(r.sha256) ||
    typeof r.publishedAt !== 'string' || !Number.isFinite(Date.parse(r.publishedAt)) ||
    r.channel !== 'preliminary'
  ) throw new Error('El manifiesto de descarga no es válido.');
  return {
    version: r.version,
    versionCode: Number(r.versionCode),
    sizeBytes: Number(r.sizeBytes),
    publishedAt: r.publishedAt,
    sha256: r.sha256,
  };
}

export type ReleaseAvailability =
  | { status: 'ready'; release: Release }
  | { status: 'preparing' }
  | { status: 'error'; message: string };

export type ReleaseFetch = (input: string, init?: RequestInit) => Promise<Response>;

export type DownloadAvailability = ReleaseAvailability | { status: 'disabled' };

/** Explicit publication switch; enabling never bypasses release validation. */
export async function checkDownloadAvailability(enabled: unknown, fetcher: ReleaseFetch = fetch, timeoutMs = 8000): Promise<DownloadAvailability> {
  if (enabled !== true) return { status: 'disabled' };
  return checkRelease(fetcher, timeoutMs);
}


/** A manifest alone never enables the button: the same-origin APK must exist. */
export async function checkRelease(fetcher: ReleaseFetch = fetch, timeoutMs = 8000): Promise<ReleaseAvailability> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const options: RequestInit = { cache: 'no-store', signal: controller.signal, redirect: 'error' };
    const manifest = await fetcher(RELEASE_MANIFEST_PATH, options);
    if (manifest.status === 404) return { status: 'preparing' };
    if (!manifest.ok) throw new Error('No se pudo consultar la descarga.');
    const release = parseRelease(await manifest.json());
    const apk = await fetcher(RELEASE_APK_PATH, { ...options, method: 'HEAD' });
    if (apk.status === 404) return { status: 'preparing' };
    const mime = apk.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
    const length = apk.headers.get('content-length');
    if (
      apk.status !== 200 ||
      !['application/vnd.android.package-archive', 'application/octet-stream'].includes(mime ?? '') ||
      (length !== null && (!/^\d+$/.test(length) || Number(length) !== release.sizeBytes))
    ) throw new Error('El archivo de descarga todavía no está listo.');
    return { status: 'ready', release };
  } catch (error) {
    return {
      status: 'error',
      message: controller.signal.aborted
        ? 'La consulta tardó demasiado. Puedes volver a intentarlo.'
        : error instanceof Error && error.message === 'El manifiesto de descarga no es válido.'
          ? 'No pudimos validar la versión disponible. Vuelve a intentarlo en un momento.'
          : 'No pudimos consultar la descarga. Vuelve a intentarlo en un momento.',
    };
  } finally {
    clearTimeout(timer);
  }
}

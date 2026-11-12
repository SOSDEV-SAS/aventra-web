declare namespace Cloudflare {
  interface Env {
    IDENTITY_SHARED_SECRET?: string;
    BUCKET?: R2Bucket;
  }
}

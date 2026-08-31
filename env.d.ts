declare namespace Cloudflare {
  interface Env {
    FILES: R2Bucket;
    DB: D1Database;
    COUPLE_CODE_HASH: string;
  }
}

// Central place for application-level URLs and config constants used by the
// React app. Server-side files (functions/solcam-check.js, vite.config.js)
// keep their own copies because they run in different runtimes (Cloudflare
// Workers / Node build) and cannot import from this module.

// SolCam HLS stream — re-exported from streamUtils for convenience and to
// keep all app config discoverable from one file.
export { streamURL as SOLCAM_STREAM_URL } from "./utils/streamUtils.js";

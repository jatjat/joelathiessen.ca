import { bindings, defineConfig, triggers } from "cf/config";
import * as entrypoint from "./index.js" with { type: "cf-worker" };

export default defineConfig({
  worker: {
    name: "joelathiessen-ca",
    entrypoint,
    compatibilityDate: "2026-09-30",
    workersDev: false,
    // Test name; joelathiessen.ca and www are added when switching over
    triggers: [triggers.fetch({ pattern: "worker-test.joelathiessen.ca/*", zone: "joelathiessen.ca" })],
    previewUrls: false,
    // No logs, so share keys in links never get stored
    observability: { enabled: false },
    // Values are uploaded with: cf deploy --secrets-file <file kept outside the repo>
    env: {
      SITE_KEY: bindings.secret(),
      SHARE_CODE: bindings.secret(),
      PROD_ORIGIN: bindings.secret(),
      PREVIEW_ORIGIN: bindings.secret(),
      OTHER_ORIGIN: bindings.secret(),
    },
  },
});

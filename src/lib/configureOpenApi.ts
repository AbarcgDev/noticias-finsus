import { cloudflareApp } from "./types";

import packageJSON from "../../package.json"

export function configureOpenApi(app: cloudflareApp) {
  app.doc('/api/doc', {
    openapi: '3.0.0',
    info: {
      version: packageJSON.version,
      title: 'Noticiero Finsus',
    },
  });
}

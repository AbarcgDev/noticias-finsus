import createApp from "../lib/createApp";
import { configureOpenApi } from "../lib/configureOpenApi";
import fuentes from "./restApi/routes/fuentes/fuentes.index"
import noticieros from "./restApi/routes/noticieros/noticieros.index"
import { serveStatic } from "hono/cloudflare-workers";


const routes = [
  fuentes,
  noticieros
]

const app = createApp()

configureOpenApi(app);

routes.forEach((route) => {
  app.route("/api", route);
})


export default app;


import createApp from "../lib/createApp";
import { configureOpenApi } from "../lib/configureOpenApi";
import fuentes from "./restApi/routes/fuentes/fuentes.index"
import noticieros from "./restApi/routes/noticieros/noticieros.index"
import { serveStatic } from "@hono/node-server/serve-static";
import { Context } from "hono";


const routes = [
  fuentes,
  noticieros
]

const app = createApp()

app.use('*', async (c: Context, next) => {
  c.header('Access-Control-Allow-Origin', '*'); // o tu dominio
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  c.header('Access-Control-Allow-Headers', '*')
  await next();
});

configureOpenApi(app);

routes.forEach((route) => {
  app.route("/api", route);
})


export default app;


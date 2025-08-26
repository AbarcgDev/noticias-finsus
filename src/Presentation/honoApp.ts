import createApp from "../lib/createApp";
import { configureOpenApi } from "../lib/configureOpenApi";
import fuentes from "./restApi/routes/fuentes/fuentes.index"
import noticieros from "./restApi/routes/noticieros/noticieros.index"
import { serveStatic } from "@hono/node-server/serve-static";
import { Context } from "hono";
import { cors } from "hono/cors";


const routes = [
  fuentes,
  noticieros
]

const app = createApp()


app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

configureOpenApi(app);

routes.forEach((route) => {
  app.route("/api", route);
})


export default app;


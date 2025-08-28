import createApp from "../lib/createApp";
import { configureOpenApi } from "../lib/configureOpenApi";
import fuentes from "./restApi/routes/fuentes/fuentes.index"
import noticieros from "./restApi/routes/noticieros/noticieros.index"
import login from "./restApi/routes/login/login.index"
import { serveStatic } from "@hono/node-server/serve-static";
import { Context } from "hono";
import { cors } from "hono/cors";
import { auth } from "hono/utils/basic-auth";
import { authMiddlware, FINSUS_DOMAIN, getJWTSecret, generateToken } from "./restApi/middlewares/validationJWT";


const Apiroutes = [
  fuentes,
  noticieros
]

const app = createApp()


app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

app.use("/api/*", authMiddlware);

configureOpenApi(app);

Apiroutes.forEach((route) => {
  app.route("/api", route);
})

app.route("auth/", login);

export default app;


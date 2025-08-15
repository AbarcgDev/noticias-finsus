import createApp from "@/lib/createApp";
import { configureOpenApi } from "@/lib/configureOpenApi";
import index from "@/presentation/restApi/routes/index.route"
import fuentes from "@/presentation/restApi/routes/fuentes/fuentes.index"
import guiones from "@/presentation/restApi/routes/guiones/guiones.index"
import noticieros from "@/presentation/restApi/routes/noticieros/noticieros.index"

const routes = [
  index,
  fuentes,
  guiones,
  noticieros
]

const app = createApp()

configureOpenApi(app);

routes.forEach((route) => {
  app.route("/api", route);
})

export default app;


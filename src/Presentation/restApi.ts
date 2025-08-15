import createApp from "@/lib/createApp";
import { configureOpenApi } from "@/lib/configureOpenApi";
import index from "@/Presentation/restApi/routes/index.route"
import fuentes from "@/Presentation/restApi/routes/fuentes/fuentes.index"
import noticieros from "@/Presentation/restApi/routes/noticieros/noticieros.index"

const routes = [
  index,
  fuentes,
  noticieros
]

const app = createApp()

configureOpenApi(app);

routes.forEach((route) => {
  app.route("/api", route);
})

export default app;


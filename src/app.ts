import createApp from "@/lib/createApp";
import { configureOpenApi } from "@/lib/configureOpenApi";
import index from "@/infrastructure/api/routes/index.route"
import fuentes from "@/infrastructure/api/routes/fuentes/fuentes.index"

const routes = [
  index,
  fuentes
]

const app = createApp()

configureOpenApi(app);

routes.forEach((route) => {
  app.route("/api", route);
})

export default app;


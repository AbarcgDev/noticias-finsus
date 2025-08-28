import { ApiRouteHandler } from "@/lib/types";
import { LoginRoute } from "./login.routes";
import { Context } from "hono";
import { FINSUS_DOMAIN, generateToken, getJWTSecret } from "../../middlewares/validationJWT";

export const loginHandler: ApiRouteHandler<LoginRoute> = async (c: Context) => {
    const { email } = await c.req.json();

    // Validar credenciales (aquí deberías validar contra tu DB)
    if ((email as string).endsWith(FINSUS_DOMAIN)) {
        const token = await generateToken(email, getJWTSecret(c))

        return c.json({
            token: token,
        }, 200);
    }

    return c.json({
        message: "Usuario no autorizado para obtener token",
    }, 403)
};
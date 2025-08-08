import { createRoute } from "@hono/zod-openapi";
import { GuionSchema } from "../schemas/GuionSchema";

export const GenerateGuionRoute = createRoute({
    method: "get",
    path: "/api/guiones",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GuionSchema
                }
            },
            description: "Devuelve un guion",
        },
    }
});
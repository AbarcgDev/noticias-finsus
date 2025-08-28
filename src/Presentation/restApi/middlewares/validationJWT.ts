import { Context, Next } from "hono";
import { jwtVerify, SignJWT } from "jose";

export const getJWTSecret = (c: Context) => new TextEncoder().encode(c.env.JWT_SECRET);

export const FINSUS_DOMAIN = "@finsus.mx";


export const authMiddlware = async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader?.startsWith("Bearer")) {
        return c.json({
            error: "No se encuentra header de autenticación"
        }, 401)
    }

    // Elimina Bearer del header de autenticacion
    const token = authHeader.substring(7);

    try {
        const { payload } = await jwtVerify(token, getJWTSecret(c));
        const email = payload.email as string;

        // Verificar que sea admin
        if (!email.endsWith(FINSUS_DOMAIN)) {
            return c.json({ error: 'Forbidden - Admin access required' }, 403);
        }

        // Agregar user al context
        c.set('user', payload);
        await next();
    } catch (error: any) {
        console.error(error.message)
        return c.json({ error: 'Invalid or expired token' }, 401);
    }


};

export const generateToken = async (email: string, secret: Uint8Array): Promise<string> => {
    return await new SignJWT({
        email,
        role: 'admin',
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret);

}
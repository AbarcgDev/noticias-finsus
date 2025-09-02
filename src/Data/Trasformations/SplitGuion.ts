export const splitGuion = (guion: string): string[] => {
    // Separa las lineas de dialogo en bloques FINEAS + SUSANA
    const split = guion.split("SUSANA:");

    // Vuelve a agregar el indicador de SUSANA: en cada inicio del bloque
    const reformat = split.filter((part) => part !== "").map((part) => {
        return "SUSANA:" + part;
    })

    // IMPORTANTE: Reduce la cantidad de bloques a la mitad pra evitar superar
    // limite de solicitudes por minuto
    //const result: string[] = [];
    //for (let i = 0; i < reformat.length; i += 2) {
    //  result.push(reformat[i] + (reformat[i + 1] ?? ""));
    //}
    return reformat;
};

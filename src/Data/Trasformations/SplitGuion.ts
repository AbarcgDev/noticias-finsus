export const splitGuion = (guion: string): string[] => {
    // Separa las lineas de dialogo en bloques FINEAS + SUSANA
    const splitted = guion.split("\n\n");
    console.info(splitted);
    return splitted;
};

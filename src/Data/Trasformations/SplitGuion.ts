export const splitGuion = (guion: string): string[] => {
    const split = guion.split("SUSANA:");
    const reformat = split.filter((part) => part !== "").map((part) => {
        return "SUSANA:" + part;
    })
    const result: string[] = [];
    for (let i = 0; i < reformat.length; i += 2) {
        result.push(reformat[i] + (reformat[i + 1] ?? ""));
    }
    return result;
};

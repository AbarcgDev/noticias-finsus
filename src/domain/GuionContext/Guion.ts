export class Guion {
    constructor(
        public readonly id: string,
        public title: string = "Noticiero Finsus" + " - " + new Date().toLocaleDateString("es-MX", {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }),
        public content: string,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) { }

    static fromObject(obj: any): Guion {
        return new Guion(
            obj.id || "ID",
            obj.title || "Noticiero Finsus" + " - " + new Date().toLocaleDateString("es-MX", {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }),
            obj.content || "",
            obj.createdAt ? new Date(obj.createdAt) : new Date(),
            obj.updatedAt ? new Date(obj.updatedAt) : new Date()
        );
    }
}
export class Fuente {
    constructor(
        public readonly id: string,
        public name: string,
        public rssUrl: string,
        public active: boolean = true,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) { }

    static fromObject(obj: any): Fuente {
        return new Fuente(
            obj.id,
            obj.name,
            obj.rssUrl,
            obj.active !== undefined ? obj.active : true,
            obj.createdAt ? new Date(obj.createdAt) : new Date(),
            obj.updatedAt ? new Date(obj.updatedAt) : new Date()
        );
    }
}
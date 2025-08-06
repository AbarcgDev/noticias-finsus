export class Guion {
    constructor(
        public readonly id: string,
        public title: string,
        public content: string,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) { }

    static fromObject(obj: any): Guion {
        return new Guion(
            obj.id,
            obj.title,
            obj.description,
            obj.createdAt ? new Date(obj.createdAt) : new Date(),
            obj.updatedAt ? new Date(obj.updatedAt) : new Date()
        );
    }
}
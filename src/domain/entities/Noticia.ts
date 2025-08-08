export class Noticia {
    constructor(
        public id: string = crypto.randomUUID(),
        public title: string,
        public content: string,
        public publicationDate: Date,
        public source: string,
    ) { }

    static fromObject(obj: any) {
        return new Noticia(
            obj.id || crypto.randomUUID(),
            obj.title,
            obj.content,
            obj.publicationDate,
            obj.source
        );
    }
}
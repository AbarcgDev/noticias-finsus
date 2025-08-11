interface GuionFields {
    id?: string,
    title?: string,
    content: string,
    createdAt?: Date,
    updatedAt?: Date,
}

export class Guion {
    public readonly id: string;
    public readonly title: string;
    public content: string;
    public readonly createdAt: Date;
    public updatedAt: Date;

    private constructor(
        content: string, // El contenido es el único campo obligatorio al crear un nuevo Guion.
        id?: string, // Hacemos 'id' opcional en el constructor
        title?: string, // Hacemos 'title' opcional en el constructor
        createdAt?: Date, // Hacemos 'createdAt' opcional en el constructor
        updatedAt?: Date // Hacemos 'updatedAt' opcional en el constructor
    ) {
        this.id = id || crypto.randomUUID();
        this.title = title || "Noticiero Finsus" + " - " + new Date().toLocaleDateString("es-MX", {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        this.content = content;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }

    static fromObject(obj: GuionFields): Guion {
        return new Guion(obj.content, obj.id, obj.title, obj.createdAt, obj.updatedAt);
    }

    static create(content: string): Guion {
        return new Guion(content);
    }
}

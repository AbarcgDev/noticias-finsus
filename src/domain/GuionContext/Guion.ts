interface GuionFields {
    id?: string,
    title?: string,
    content: string,
    createdAt?: Date,
    updatedAt?: Date,
    status: string
}

export class Guion {
    public readonly id: string;
    public readonly title: string;
    public content: string;
    public readonly createdAt: Date;
    public updatedAt: Date;
    public status: string;

    private constructor(
        content: string,
        status: string,
        id?: string,
        title?: string,
        createdAt?: Date,
        updatedAt?: Date
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
        this.status = status ?? "ON VALIDATION;"
    }

    static fromObject(obj: GuionFields): Guion {
        return new Guion(obj.content, obj.status, obj.id, obj.title, obj.createdAt, obj.updatedAt);
    }

    static create(content: string, status: string): Guion {
        return new Guion(content, status);
    }
}

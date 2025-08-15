import { Noticiero } from "@/Models/Noticiero";

export class NoticierosD1Repository implements INoticierosRepository {
    constructor(private readonly db: D1Database) { }
    getById(id: string): Promise<Noticiero> {
        const query = this.db.prepare("SELECT * FROM noticieros WHERE id = ?");
        return query.bind(id).first().then((row: Noticiero) => {
            if (!row) {
                return Promise.reject(new Error("Noticiero no encontrado"));
            }
            return {
                id: row.id,
                title: row.title,
                guion guion,
                row.wav_audio_id,
                new Date(row.publication_date)
            };
        });
    }
    async findAll(): Promise<Noticiero[]> {
        const { results } = await this.db.prepare("SELECT * FROM noticieros").all()
        let resolution: Noticiero[] = [];
        if (results) {
            resolution = results.map((row: any) => new Noticiero(
                row.id,
                row.title,
                row.transcript,
                row.wav_audio_id,
                new Date(row.publication_date)
            ));
        }
        return Promise.resolve(resolution);
    }
    async save(noticiero: Noticiero): Promise<Noticiero> {
        const query = this.db.prepare(`
            INSERT INTO noticieros (
            id, 
            title, 
            transcript, 
            wav_audio_id, 
            publication_date) 
            VALUES
            (?, ?, ?, ?, ?);
            `);
        await query.bind(
            noticiero.id,
            noticiero.title,
            noticiero.transcript,
            noticiero.wavAudioId,
            noticiero.publication_date.toISOString()
        ).run();
        return Promise.resolve(noticiero);
    }

    delete(id: string): Promise<Noticiero> {
        throw new Error("Method not implemented.");
    }
}

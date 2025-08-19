import { Noticiero } from "@/Data/Models/Noticiero";
import { ILatestNoticieroRepository } from "@/Repositories/ILatestNoticieroRepository";

export class LatestNoticieroKVRepository implements ILatestNoticieroRepository {
    public static readonly LATEST_NOTICIERO_KEY = "latest";

    constructor(private readonly kv: KVNamespace) { }

    async findLatest(): Promise<Noticiero | null> {
        const latest = await this.kv.get(LatestNoticieroKVRepository.LATEST_NOTICIERO_KEY);
        if (latest) {
            return JSON.parse(latest);
        }
        return null;
    }

    async insertLatest(noticiero: Noticiero): Promise<void> {
        await this.kv.put(
            LatestNoticieroKVRepository.LATEST_NOTICIERO_KEY,
            JSON.stringify(noticiero)
        )
    }

}
import { Noticiero } from "@/Data/Models/Noticiero";
import { ILatestNoticieroRepository } from "@/Repositories/ILatestNoticieroRepository";
import { timeout } from "hono/timeout";

export class LatestNoticieroKVRepository implements ILatestNoticieroRepository {
    public static readonly LATEST_NOTICIERO_KEY = "latest";
    public static readonly CENSOR_LIST_KEY = "censor-list";

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

    async getCensorList(): Promise<string[] | null> {
        const censorList = await this.kv.get(LatestNoticieroKVRepository.CENSOR_LIST_KEY)
        if (censorList) {
            return JSON.parse(censorList);
        }
        return null;
    }

    async insertCensorList(list: string[]): Promise<void> {
        await this.kv.put(
            LatestNoticieroKVRepository.CENSOR_LIST_KEY,
            JSON.stringify(list)
        )
    }

    dispose() {
        (this.kv as any).dispose();
    }
}
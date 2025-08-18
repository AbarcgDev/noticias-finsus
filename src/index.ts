import restApi from "./Presentation/restApi"
import { pipelineNoticieroDraft } from "./Data/Pipelines/PipelineNoticieroDraft";
import { RSSChanelRepository } from "./Infrastructure/RssChanelD1Repository";
import { NoticierosD1Repository } from "./Infrastructure/NoticierosD1Repository";
import { pipelineNoticias } from "./Data/Pipelines/PipelineNoticias";
import { getFinsusNoticiasFromGoogle } from "./Data/Extract/GetFinsusNewsScraping";
import { AudioR2Repository } from "./Infrastructure/NoticieroAudioR2Repository";
import { transformWavToMp3 } from "./Data/Trasformations/TransformWAVToMP3";

export default {
  fetch: restApi.fetch,
  async scheduled(controller: ScheduledController, env: Cloudflare.Env, ctx: ExecutionContext) {
    //ctx.waitUntil(
    //pipelineNoticieroDraft(
    //new RSSChanelRepository(env.DB),
    //new NoticierosD1Repository(env.DB),
    //env.GEMINI_API_KEY
    //)
    //)
    //await getFinsusNoticiasFromGoogle()
    console.info("Almacenando mp3");
    const id = "d0dbd362-a1be-4e9b-a817-fdc1b1f02e69";
    const audioRepo = new AudioR2Repository(env.NOTICIEROS_STORAGE);
    const wav = await (await audioRepo.getAudioWAV(id)).arrayBuffer();
    const wavBuffer = new Int16Array(wav);
    const mp3 = await transformWavToMp3(wavBuffer)
    await audioRepo.uploadAudioMp3(id, mp3);
  }
};

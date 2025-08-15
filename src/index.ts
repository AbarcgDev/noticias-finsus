import restApi from "@/Presentation/restApi"
import { pipelineNoticieroDraft } from "./Data/Pipelines/PipelineNoticieroDraft";
import { RSSChanelRepository } from "./Infrastructure/RssChanelD1Repository";
import { NoticierosD1Repository } from "./Infrastructure/NoticierosD1Repository";
import { pipelineNoticias } from "./Data/Pipelines/PipelineNoticias";
import { getFinsusNoticiasFromGoogle } from "./Data/Extract/GetFinsusNewsScraping";

export default {
  fetch: restApi.fetch,
  async scheduled(controller: ScheduledController, env: Cloudflare.Env, ctx: ExecutionContext) {
    //await pipelineNoticieroDraft(
    //new RSSChanelRepository(env.DB),
    //new NoticierosD1Repository(env.DB),
    //env.GEMINI_API_KEY
    //)
    await getFinsusNoticiasFromGoogle()
  }
};

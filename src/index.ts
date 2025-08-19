import honoApp from "./Presentation/honoApp"
import { pipelineNoticieroDraft } from "./Data/Pipelines/PipelineNoticieroDraft";
import { RSSChanelRepository } from "./Infrastructure/RssChanelD1Repository";
import { NoticierosD1Repository } from "./Infrastructure/NoticierosD1Repository";

export default {
  fetch: honoApp.fetch,
  async scheduled(controller: ScheduledController, env: Cloudflare.Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      pipelineNoticieroDraft(
        new RSSChanelRepository(env.DB),
        new NoticierosD1Repository(env.DB),
        env.GEMINI_API_KEY
      )
    )
  }
};

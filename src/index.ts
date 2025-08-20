import honoApp from "./Presentation/honoApp"
import { pipelineNoticieroDraft } from "./Data/Pipelines/PipelineNoticieroDraft";
import { RSSChanelRepository } from "./Infrastructure/RssChanelD1Repository";
import { NoticierosD1Repository } from "./Infrastructure/NoticierosD1Repository";
import { NotasFinsusD1Repository } from "./Infrastructure/NotasFinsusD1Repository";
import { AudioGenerationWorkflow } from "./Infrastructure/AudioGenerationWorkflow";

export default {
  fetch: honoApp.fetch,
  async scheduled(controller: ScheduledController, env: Cloudflare.Env, ctx: ExecutionContext) {
    await pipelineNoticieroDraft(
      new RSSChanelRepository(env.DB),
      new NoticierosD1Repository(env.DB),
      new NotasFinsusD1Repository(env.DB),
      env.GEMINI_API_KEY
    )
  },
};

export { AudioGenerationWorkflow }
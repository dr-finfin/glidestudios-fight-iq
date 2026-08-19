import { WorkflowEntrypoint, WorkflowStep } from "cloudflare:workers";
import type { WorkflowEvent } from "cloudflare:workers";
import { generateStoryConcept } from "./ai/gemini";
import { saveStory } from "./db/supabase";
import type { Env } from "./config";
import type { StorySeedParams } from "./types/fight-iq";

export class FightIQStoryPipeline extends WorkflowEntrypoint<Env, StorySeedParams> {
  async run(event: WorkflowEvent<StorySeedParams>, step: WorkflowStep) {
    const params = event.payload ?? {};

    const storySeed = await step.do("choose-story-seed", async () => {
      if (params.topic?.trim()) return params.topic.trim();

      return "Find a compelling combat-sports story involving a fighter, rivalry, fight, comeback, downfall, controversy, or career turning point.";
    });

    const story = await step.do(
      "generate-story-concept",
      {
        retries: { limit: 3, delay: "5 seconds", backoff: "exponential" },
        timeout: "2 minutes",
      },
      async () => generateStoryConcept(this.env.GEMINI_API_KEY, params, storySeed),
    );

    const saved = await step.do(
      "save-story-concept",
      {
        retries: { limit: 3, delay: "5 seconds", backoff: "exponential" },
        timeout: "2 minutes",
      },
      async () =>
        saveStory(this.env.SUPABASE_URL, this.env.SUPABASE_SERVICE_ROLE_KEY, {
          title: story.title,
          category: story.category,
          story_score: story.story_score,
          hook: story.hook,
          why_now_or_evergreen: story.why_now_or_evergreen,
          fighters: story.fighters,
          risk_flags: story.risk_flags,
          channel_slug: "fight-iq",
        }),
    );

    return {
      ok: true,
      story,
      saved,
      generatedAt: new Date().toISOString(),
    };
  }
}

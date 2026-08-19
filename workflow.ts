import { WorkflowEntrypoint, WorkflowStep } from "cloudflare:workers";
import type { WorkflowEvent } from "cloudflare:workers";

interface Env {
  FIGHT_IQ_STORY_PIPELINE: Workflow;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  GEMINI_API_KEY: string;
}

type Params = {
  channel?: string;
  category?: "fighter_story" | "rivalry" | "fight_story" | "what_happened";
  topic?: string;
};

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const raw = fenced?.[1] ?? text;
  return JSON.parse(raw);
}

export class FightIQStoryPipeline extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const params = event.payload ?? {};

    const storySeed = await step.do("choose-story-seed", async () => {
      if (params.topic?.trim()) {
        return params.topic.trim();
      }

      return "Find a compelling combat-sports story involving a fighter, rivalry, fight, comeback, downfall, controversy, or career turning point.";
    });

    const story = await step.do(
      "generate-story-concept",
      { retries: { limit: 3, delay: "5 seconds", backoff: "exponential" } },
      async () => {
        const prompt = `You are the Story Hunter for Fight IQ, a combat-sports storytelling YouTube channel.\n\nGoal: identify one strong video concept.\nChannel: ${params.channel ?? "Fight IQ"}\nPreferred category: ${params.category ?? "any"}\nSeed: ${storySeed}\n\nReturn ONLY valid JSON with these keys:\n{\n  "title": string,\n  "category": "fighter_story" | "rivalry" | "fight_story" | "what_happened",\n  "fighters": string[],\n  "hook": string,\n  "why_now_or_evergreen": string,\n  "story_score": number,\n  "risk_flags": string[]\n}\n\nPrioritize conflict, emotion, curiosity, visual potential, and an explainable narrative. Do not invent factual claims; this is only a concept.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(this.env.GEMINI_API_KEY)}`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.8 },
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`Gemini error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json<GeminiResponse>();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Gemini returned no text");
        return extractJson(text) as Record<string, unknown>;
      },
    );

    // The database write is intentionally isolated so it can be changed
    // without touching the AI step. We use Supabase's PostgREST API.
    const saved = await step.do(
      "save-story-concept",
      { retries: { limit: 3, delay: "5 seconds", backoff: "exponential" } },
      async () => {
        const response = await fetch(`${this.env.SUPABASE_URL}/rest/v1/stories`, {
          method: "POST",
          headers: {
            apikey: this.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${this.env.SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            title: story.title,
            category: story.category,
            status: "idea",
            story_score: story.story_score,
            hook: story.hook,
            why_now_or_evergreen: story.why_now_or_evergreen,
            fighters: story.fighters,
            risk_flags: story.risk_flags,
          }),
        });

        if (!response.ok) {
          throw new Error(`Supabase error ${response.status}: ${await response.text()}`);
        }

        return await response.json();
      },
    );

    return { story, saved };
  }
}

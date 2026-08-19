import { FightIQStoryPipeline } from "./workflow";
import type { Env } from "./config";
import type { StorySeedParams } from "./types/fight-iq";

export { FightIQStoryPipeline };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({
        ok: true,
        service: "glidestudios-fight-iq",
        timestamp: new Date().toISOString(),
      });
    }

    if (url.pathname === "/run" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as StorySeedParams;
      const instance = await env.FIGHT_IQ_STORY_PIPELINE.create({ params: body });
      return Response.json(
        { instanceId: instance.id, status: "queued" },
        { status: 202 },
      );
    }

    if (url.pathname === "/status" && request.method === "GET") {
      const id = url.searchParams.get("instanceId");
      if (!id) {
        return Response.json(
          { error: "instanceId is required" },
          { status: 400 },
        );
      }

      const instance = await env.FIGHT_IQ_STORY_PIPELINE.get(id);
      return Response.json(await instance.status());
    }

    return Response.json({
      service: "GlideStudios / Fight IQ",
      endpoints: ["GET /health", "POST /run", "GET /status?instanceId=..."],
    });
  },
} satisfies ExportedHandler<Env>;

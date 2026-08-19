import { FightIQStoryPipeline } from "./workflow";

export { FightIQStoryPipeline };

interface Env {
  FIGHT_IQ_STORY_PIPELINE: Workflow;
}

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
      const body = await request.json().catch(() => ({}));
      const instance = await env.FIGHT_IQ_STORY_PIPELINE.create({
        params: body,
      });
      return Response.json({ instanceId: instance.id, status: "queued" }, { status: 202 });
    }

    if (url.pathname === "/status") {
      const id = url.searchParams.get("instanceId");
      if (!id) return Response.json({ error: "instanceId is required" }, { status: 400 });
      const instance = await env.FIGHT_IQ_STORY_PIPELINE.get(id);
      return Response.json(await instance.status());
    }

    return new Response("GlideStudios / Fight IQ", { status: 200 });
  },
} satisfies ExportedHandler<Env>;

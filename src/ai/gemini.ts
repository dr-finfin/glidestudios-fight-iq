import type { StoryConcept, StorySeedParams } from "../types/fight-iq";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return JSON.parse(fenced?.[1] ?? text);
}

function normalizeConcept(value: unknown): StoryConcept {
  if (!value || typeof value !== "object") {
    throw new Error("Gemini returned a non-object story concept");
  }

  const item = value as Record<string, unknown>;
  const category = String(item.category);
  const allowed = new Set([
    "fighter_story",
    "rivalry",
    "fight_story",
    "what_happened",
  ]);

  if (!allowed.has(category)) {
    throw new Error(`Invalid story category: ${category}`);
  }

  const score = Number(item.story_score);
  if (!Number.isFinite(score) || score < 0 || score > 80) {
    throw new Error(`Invalid story score: ${item.story_score}`);
  }

  return {
    title: String(item.title ?? "").trim(),
    category: category as StoryConcept["category"],
    fighters: Array.isArray(item.fighters) ? item.fighters.map(String) : [],
    hook: String(item.hook ?? "").trim(),
    why_now_or_evergreen: String(item.why_now_or_evergreen ?? "").trim(),
    story_score: score,
    risk_flags: Array.isArray(item.risk_flags)
      ? item.risk_flags.map(String)
      : [],
  };
}

export async function generateStoryConcept(
  apiKey: string,
  params: StorySeedParams,
  seed: string,
): Promise<StoryConcept> {
  const prompt = `You are the Story Hunter for Fight IQ, a combat-sports storytelling YouTube channel.

Fight IQ covers fighter stories, rivalries, fight stories, comebacks, downfalls and career turning points.

Channel: ${params.channel ?? "Fight IQ"}
Preferred category: ${params.category ?? "any"}
Seed: ${seed}

Identify ONE strong episode concept. Prioritize narrative conflict, emotional stakes, curiosity, recognizable fighters, visual potential and evergreen value.

Do not invent factual claims. This stage is a concept only.

Return ONLY valid JSON:
{
  "title": "string",
  "category": "fighter_story | rivalry | fight_story | what_happened",
  "fighters": ["string"],
  "hook": "string",
  "why_now_or_evergreen": "string",
  "story_score": 0,
  "risk_flags": ["string"]
}

Score out of 80 using these dimensions: narrative strength, conflict, emotional stakes, curiosity, fighter popularity, visual potential, search potential, evergreen potential.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini error ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text");

  return normalizeConcept(extractJson(text));
}

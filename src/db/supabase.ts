export async function saveStory(
  baseUrl: string,
  serviceRoleKey: string,
  story: {
    title: string;
    category: string;
    story_score: number;
    hook: string;
    why_now_or_evergreen: string;
    fighters: string[];
    risk_flags: string[];
    channel_slug: string;
  },
) {
  const root = baseUrl.replace(/\/$/, "");
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };

  const channelResponse = await fetch(
    `${root}/rest/v1/channels?select=id&slug=eq.${encodeURIComponent(story.channel_slug)}&limit=1`,
    { headers },
  );

  if (!channelResponse.ok) {
    throw new Error(
      `Supabase channel lookup error ${channelResponse.status}: ${await channelResponse.text()}`,
    );
  }

  const channels = (await channelResponse.json()) as Array<{ id: string }>;
  const channelId = channels[0]?.id;

  if (!channelId) {
    throw new Error(`Supabase channel not found: ${story.channel_slug}`);
  }

  const response = await fetch(`${root}/rest/v1/stories`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({
      channel_id: channelId,
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
    throw new Error(`Supabase story insert error ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

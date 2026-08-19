export const STORY_CATEGORIES = [
  "fighter_story",
  "rivalry",
  "fight_story",
  "what_happened",
] as const;

export type StoryCategory = (typeof STORY_CATEGORIES)[number];

export interface StoryConcept {
  title: string;
  category: StoryCategory;
  fighters: string[];
  hook: string;
  why_now_or_evergreen: string;
  story_score: number;
  risk_flags: string[];
}

export interface StorySeedParams {
  channel?: string;
  category?: StoryCategory;
  topic?: string;
}

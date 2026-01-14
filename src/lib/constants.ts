export const STATUS_PRESETS = [
  // Low energy
  { value: "recharging", label: "Recharging" },
  { value: "need_space", label: "Need space" },
  { value: "hibernating", label: "Hibernating" },
  { value: "introverting", label: "Introverting" },
  { value: "self_care", label: "Self care day" },
  { value: "at_capacity", label: "At capacity" },
  { value: "peopled_out", label: "Peopled out" },
  { value: "low_energy", label: "Low energy today" },
  { value: "alone_time", label: "Need alone time" },
  { value: "dnd", label: "Do not disturb" },
  // Medium energy
  { value: "text_only", label: "Text only please" },
  { value: "small_groups", label: "Small groups only" },
  { value: "close_friends", label: "Close friends only" },
  { value: "busy_text", label: "Busy but text me" },
  { value: "ping_later", label: "Working, ping later" },
  { value: "coffee_first", label: "Coffee first" },
  { value: "just_vibing", label: "Just vibing" },
  { value: "movie_night", label: "Movie night in" },
  { value: "gaming", label: "Gaming mode" },
  { value: "maybe_later", label: "Maybe later" },
  // High energy
  { value: "open_to_plans", label: "Open to plans" },
  { value: "down_to_hang", label: "Down to hang" },
  { value: "feeling_social", label: "Feeling social" },
  { value: "up_for_call", label: "Up for a call" },
  { value: "come_hang", label: "Come hang!" },
  { value: "weekend_mode", label: "Weekend mode" },
  { value: "lets_go", label: "Let's go!" },
  { value: "party_mode", label: "Party mode" },
  { value: "adventures", label: "Ready for adventures" },
  { value: "bored", label: "Bored, entertain me" },
] as const;

export const STATUS_PRESETS_MAP: Record<string, string> = Object.fromEntries(
  STATUS_PRESETS.map((p) => [p.value, p.label])
);

export type StatusPresetValue = (typeof STATUS_PRESETS)[number]["value"];

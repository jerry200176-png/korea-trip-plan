/**
 * Extra reader-facing scrub rules shared by PDF / site presentation helpers.
 * Visual-function labels stay in media metadata (purpose_note), not reader output.
 */

const FUNCTION_LABELS = [
  "Orient",
  "Explain",
  "Warn",
  "Rescue",
  "Compare",
  "Identify",
  "Remember",
  "Inspire",
] as const;

/** Natural Chinese / plain replacements for internal teaching labels. */
export function scrubVisualFunctionLabels(text: string): string {
  let out = text;
  // Multi-word phrases first (before bare label stripping)
  out = out.replace(/\bRescue Flow\b/gi, "救援步驟");
  out = out.replace(/\bAlways Ask\b/gi, "現場務必問");
  out = out.replace(/\bHard Stop\b/gi, "立刻停止並求助");
  out = out.replace(/\bLow-Energy\b/gi, "低體力");
  out = out.replace(/\bTaxi Rescue\b/gi, "改搭計程車");
  out = out.replace(/計程車\s*Rescue/g, "計程車救援");
  out = out.replace(/\bDate Pending\b/gi, "日期待決定");
  out = out.replace(/\bBooking Ready\b/gi, "尚未完成預訂");
  // Parenthetical function tags: （Identify） / (Orient／Explain)
  out = out.replace(/[（(]\s*(?:Orient|Explain|Warn|Rescue|Compare|Identify|Remember|Inspire)(?:\s*[／/·|,、]\s*(?:Orient|Explain|Warn|Rescue|Compare|Identify|Remember|Inspire))*\s*[）)]/gi, "");
  // "功能：Orient｜Explain｜Identify" style footers
  out = out.replace(/功能\s*[:：]\s*(?:Orient|Explain|Warn|Rescue|Compare|Identify|Remember|Inspire)(?:\s*[｜|／/·,、]\s*(?:Orient|Explain|Warn|Rescue|Compare|Identify|Remember|Inspire))*/gi, "");
  // Standalone English function words (word boundary)
  for (const label of FUNCTION_LABELS) {
    out = out.replace(new RegExp(`\\b${label}\\b`, "g"), "");
  }
  // Profile / constraint snake_case keys that leaked into diagrams
  out = out.replace(/\bavoid_long_queues\b/g, "避免長時間排隊");
  out = out.replace(/\bavoid_crustacean_seafood\b/g, "避免甲殼類海鮮");
  out = out.replace(/\bfeet_tire_easily\b/g, "腳容易累");
  out = out.replace(/\bno_alcohol\b/g, "不喝酒");
  out = out.replace(/\bprimary_moment\b/g, "主要時刻");
  out = out.replace(/\bmemory_prompts\b/g, "回憶提示");
  // Cleanup punctuation left by removals
  out = out.replace(/\s*[｜|]\s*[｜|]/g, "｜");
  out = out.replace(/[·・]\s*[·・]/g, "·");
  out = out.replace(/\s{2,}/g, " ");
  out = out.replace(/\s+([，。；：、])/g, "$1");
  out = out.replace(/（\s*）/g, "");
  out = out.replace(/\(\s*\)/g, "");
  return out.trim();
}

export const READER_FORBIDDEN_FUNCTION_RE =
  /\b(?:Orient|Explain|Warn|Rescue|Compare|Identify|Remember)\b/;

export const READER_FORBIDDEN_PDFSEC_RE = /PDFSEC:/;

export const READER_FORBIDDEN_STATUS_RE =
  /\b(?:Date Pending|Booking Ready)\b/i;

/** Raw snake_case profile / engineering keys that must not appear in reader surfaces. */
export const READER_FORBIDDEN_SNAKE_RE =
  /\b(?:avoid_long_queues|avoid_crustacean_seafood|feet_tire_easily|primary_moment|memory_prompts|place_id|foundation_slice|route_option|start_date|end_date|duration_days)\b/;

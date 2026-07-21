/**
 * Extra reader-facing scrub rules shared by PDF / site presentation helpers.
 * Visual-function labels and workflow jargon stay in media metadata only.
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
  out = out.replace(/\bHard Stop\b/gi, "必須停止並求助");
  out = out.replace(/\bHardStop\b/gi, "必須停止並求助");
  out = out.replace(/\bLow-Energy\b/gi, "低體力");
  out = out.replace(/\bTaxi Rescue\b/gi, "改搭計程車");
  out = out.replace(/計程車\s*Rescue/g, "計程車救援");
  out = out.replace(/\bDate Pending\b/gi, "日期待決定");
  out = out.replace(/\bBooking Ready\b/gi, "尚未完成預訂");
  out = out.replace(/\bCore Plan\b/gi, "主要行程");
  out = out.replace(/\bPrimary shortlist\b/gi, "優先候選清單");
  out = out.replace(/\bshortlist\b/gi, "候選清單");
  out = out.replace(/\bShortlist\b/g, "候選清單");
  out = out.replace(/\bharden\b/gi, "再次確認並鎖定");
  out = out.replace(/\bOptional\b/gi, "可選／有體力再去");
  // Bare Core after Core Plan handled — keep Chinese contexts readable
  out = out.replace(/\bCore\b/gi, "主要行程");
  // Parenthetical function tags: （Identify） / (Orient／Explain)
  out = out.replace(
    /[（(]\s*(?:Orient|Explain|Warn|Rescue|Compare|Identify|Remember|Inspire)(?:\s*[／/·|,、]\s*(?:Orient|Explain|Warn|Rescue|Compare|Identify|Remember|Inspire))*\s*[）)]/gi,
    "",
  );
  out = out.replace(
    /功能\s*[:：]\s*(?:Orient|Explain|Warn|Rescue|Compare|Identify|Remember|Inspire)(?:\s*[｜|／/·,、]\s*(?:Orient|Explain|Warn|Rescue|Compare|Identify|Remember|Inspire))*/gi,
    "",
  );
  // Natural Chinese replacements before bare-label stripping (attribution leftovers)
  out = out.replace(/\bwarn\b/gi, "提醒");
  out = out.replace(/\bcompare\b/gi, "比較");
  out = out.replace(/\borient\b/gi, "導覽");
  out = out.replace(/\bexplain\b/gi, "說明");
  out = out.replace(/\brescue\b/gi, "救援");
  out = out.replace(/\bidentify\b/gi, "辨識");
  out = out.replace(/\bremember\b/gi, "記住");
  out = out.replace(/\binspire\b/gi, "啟發");
  for (const label of FUNCTION_LABELS) {
    out = out.replace(new RegExp(`\\b${label}\\b`, "gi"), "");
  }
  // Profile / constraint snake_case keys
  out = out.replace(/\bavoid_long_queues\b/g, "避免長時間排隊");
  out = out.replace(/\bavoid_crustacean_seafood\b/g, "避免甲殼類海鮮");
  out = out.replace(/\bfeet_tire_easily\b/g, "腳容易累");
  out = out.replace(/\bno_alcohol\b/g, "不喝酒");
  out = out.replace(/\bprimary_moment\b/g, "主要時刻");
  out = out.replace(/\bmemory_prompts\b/g, "回憶提示");
  // Wrong Korean crustacean phrase → correct
  out = out.replace(/갑각류 해산은 빼 주실 수 있나요\?/g, "갑각류는 빼 주실 수 있나요?");
  // Cleanup
  out = out.replace(/\s*[｜|]\s*[｜|]/g, "｜");
  out = out.replace(/[·・]\s*[·・]/g, "·");
  out = out.replace(/\s{2,}/g, " ");
  out = out.replace(/\s+([，。；：、])/g, "$1");
  out = out.replace(/（\s*）/g, "");
  out = out.replace(/\(\s*\)/g, "");
  return out.trim();
}

export const READER_FORBIDDEN_FUNCTION_RE =
  /\b(?:Orient|Explain|Warn|Rescue|Compare|Identify|Remember)\b/i;

export const READER_FORBIDDEN_PDFSEC_RE = /PDFSEC:/;

export const READER_FORBIDDEN_STATUS_RE =
  /\b(?:Date Pending|Booking Ready)\b/i;

export const READER_FORBIDDEN_SNAKE_RE =
  /\b(?:avoid_long_queues|avoid_crustacean_seafood|feet_tire_easily|primary_moment|memory_prompts|place_id|foundation_slice|route_option|start_date|end_date|duration_days)\b/;

/** Workflow jargon that must not appear in reader HTML / SVG a11y / PDF text. */
export const READER_FORBIDDEN_JARGON_RE =
  /\b(?:harden|Hard Stop|HardStop|Optional|Core Plan|shortlist)\b/i;

/** Bare "Core" as a workflow token (word boundary). */
export const READER_FORBIDDEN_CORE_RE = /\bCore\b/i;

/** Incorrect Korean crustacean phrase (exact regression). */
export const READER_FORBIDDEN_KO_CRUSTACEAN_RE = /갑각류 해산은 빼 주실 수 있나요\?/;

export const READER_REQUIRED_KO_CRUSTACEAN = "갑각류는 빼 주실 수 있나요?";

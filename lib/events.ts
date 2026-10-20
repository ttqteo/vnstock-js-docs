export type EventType = "dividend" | "split" | "meeting" | "rights" | "other";

/** Lowercase without Vietnamese diacritics: "Phát hành cổ phiếu" -> "phat hanh co phieu". */
function fold(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
}

/** Heuristic event type from its title or type name. */
export function classifyEvent(eventName: string): EventType {
  const s = fold(eventName);
  if (s.includes("co tuc") || s.includes("dividend")) return "dividend";
  if (s.includes("chia tach") || s.includes("tach") || s.includes("split")) return "split";
  if (s.includes("dhcd") || s.includes("dai hoi") || s.includes("meeting")) return "meeting";
  if (s.includes("phat hanh") || s.includes("quyen mua") || s.includes("esop") || s.includes("issue")) return "rights";
  return "other";
}

/** Filters out garbage dates from the source (e.g. year 54381). */
export function isValidDate(dateStr?: string): boolean {
  if (!dateStr) return false;
  const year = parseInt(dateStr.slice(0, 4));
  return year >= 2000 && year <= 2100;
}

export interface DressCodeColor {
  name: string;
  hex: string;
}

export const DEFAULT_DRESS_CODE_COLORS: DressCodeColor[] = [
  { name: "Sage Green", hex: "#A8D5BA" },
];

/**
 * Parses a dress_code_color setting value.
 * Supports both legacy hex strings (e.g. "#A8D5BA") and a JSON array of {name, hex}.
 */
export function parseDressCodeColors(raw?: string | null): DressCodeColor[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((c) => c && typeof c.hex === "string")
          .map((c) => ({
            name: typeof c.name === "string" ? c.name : "",
            hex: c.hex,
          }))
          .slice(0, 3);
      }
    } catch {
      // fall through to legacy handling
    }
  }

  // Legacy single-hex value
  return [{ name: "", hex: trimmed }];
}

export function serializeDressCodeColors(colors: DressCodeColor[]): string {
  const cleaned = colors
    .filter((c) => c.hex && c.hex.trim())
    .slice(0, 3)
    .map((c) => ({ name: c.name.trim(), hex: c.hex.trim() }));
  return JSON.stringify(cleaned);
}

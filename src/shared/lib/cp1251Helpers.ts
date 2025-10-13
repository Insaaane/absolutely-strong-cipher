export function cp1251Encode(s: string): number[] {
  const out: number[] = [];
  for (const ch of s) {
    const code = ch.codePointAt(0) || 0;
    // ASCII 0x00..0x7F
    if (code >= 0x00 && code <= 0x7f) {
      out.push(code);
      continue;
    }
    // А..Я -> 0xC0..0xDF
    if (code >= 0x0410 && code <= 0x042f) {
      out.push(0xc0 + (code - 0x0410));
      continue;
    }
    // а..я -> 0xE0..0xFF
    if (code >= 0x0430 && code <= 0x044f) {
      out.push(0xe0 + (code - 0x0430));
      continue;
    }
    // Ё and ё
    if (code === 0x0401) {
      out.push(0xa8);
      continue;
    }
    if (code === 0x0451) {
      out.push(0xb8);
      continue;
    }
    // If unknown character, use '?' (0x3F)
    out.push(0x3f);
  }
  return out;
}

export function cp1251Decode(bytes: number[]): string {
  const chars: string[] = [];
  for (const b of bytes) {
    if (b >= 0x00 && b <= 0x7f) {
      chars.push(String.fromCharCode(b));
      continue;
    }
    if (b >= 0xc0 && b <= 0xdf) {
      chars.push(String.fromCharCode(0x0410 + (b - 0xc0))); // А..Я
      continue;
    }
    if (b >= 0xe0 && b <= 0xff) {
      chars.push(String.fromCharCode(0x0430 + (b - 0xe0))); // а..я
      continue;
    }
    if (b === 0xa8) {
      chars.push(String.fromCharCode(0x0401));
      continue;
    }
    if (b === 0xb8) {
      chars.push(String.fromCharCode(0x0451));
      continue;
    }
    // fallback
    chars.push("?");
  }
  return chars.join("");
}

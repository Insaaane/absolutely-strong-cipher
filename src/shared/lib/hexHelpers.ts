export function bytesToHex(bytes: number[]): string {
  return bytes
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join(" ");
}

export function hexToBytes(hex: string): number[] {
  const cleaned = hex.replace(/[^0-9A-Fa-f]/g, "");
  if (cleaned.length % 2 !== 0) {
    throw new Error("Неверный hex: нечётное количество символов");
  }
  const out: number[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    out.push(parseInt(cleaned.slice(i, i + 2), 16));
  }
  return out;
}

export function normalizeHex(hex: string) {
  const cleaned = hex.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  return cleaned.match(/.{1,2}/g)?.join(" ") || "";
}

export function xorBytes(a: number[], b: number[]): number[] {
  if (a.length !== b.length)
    throw new Error("Длины байтовых массивов должны совпадать");
  return a.map((v, i) => v ^ b[i]);
}

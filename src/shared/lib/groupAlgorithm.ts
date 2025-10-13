import { bytesToHex, hexToBytes } from "./hexHelpers";

export function generateRandomBytes(len: number): number[] {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr);
}

export function makeVariantsFromKey(keyBytes: number[], count = 10): string[] {
  const variants: string[] = [];
  const used = new Set<number>();
  let tries = 0;
  while (variants.length < count && tries < 1000) {
    const mask = Math.floor(Math.random() * 255) + 1; // 1..255
    if (used.has(mask)) {
      tries++;
      continue;
    }
    used.add(mask);
    const body = keyBytes.map((b) => b ^ mask);
    const variantHex = bytesToHex([mask]) + " " + bytesToHex(body);
    variants.push(variantHex);
  }
  return variants;
}

export function variantToKeyBytes(variantHex: string): number[] {
  const bytes = hexToBytes(variantHex);
  if (bytes.length < 1) throw new Error("Неверный вариант ключа");
  const mask = bytes[0];
  const body = bytes.slice(1);
  return body.map((b) => b ^ mask);
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

export function randomLetters(length: number): string {
  return Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
}

export function uniqueContactName(prefix: string): string {
  return `${prefix} ${randomLetters(6)}`;
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}.${randomLetters(8)}@example.com`;
}

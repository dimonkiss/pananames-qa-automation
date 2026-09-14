export function parsePrice(text: string): number {
  const matches = text.match(/\$[\d,]+\.\d{2}/g);
  if (!matches || matches.length === 0) {
    throw new Error(`No price found in "${text}"`);
  }
  const last = matches[matches.length - 1];
  return parseFloat(last.replace(/[$,]/g, ''));
}

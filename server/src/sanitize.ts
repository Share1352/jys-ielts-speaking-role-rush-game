const MAX_NAME_LENGTH = 30;

export function sanitizeText(input: string): string {
  return input
    .replace(/[<>"'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeName(input: string): string {
  return sanitizeText(input).slice(0, MAX_NAME_LENGTH);
}

export function sanitizeGuessInput(input: string): string {
  return sanitizeText(input).slice(0, 120);
}

const MAX_NAME_LENGTH = 30;
const MAX_GUESS_LENGTH = 120;
const ROOM_CODE_PATTERN = /^[A-Z0-9]+$/;

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
  return sanitizeText(input).slice(0, MAX_GUESS_LENGTH);
}

export function sanitizeRoomCode(input: string): string {
  const code = sanitizeText(input).toUpperCase();
  if (!code || !ROOM_CODE_PATTERN.test(code)) throw new Error('Invalid room code format');
  return code;
}

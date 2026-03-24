const VALID_LENGTH = 8;

export function isValidPassword (password: string) {
  if (password.length < VALID_LENGTH) return false;
  if (!password.match(/\d+/)) return false;
  if (!password.match(/[a-z]+/)) return false;
  if (!password.match(/[A-Z]+/)) return false;
  return true;
}
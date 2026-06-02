import crypto from "crypto";

const SALT_LENGTH = 16;
const ITERATIONS = 310000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

export function hashPin(pin: string) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derived = crypto.pbkdf2Sync(pin, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `${salt}$${derived}`;
}

export function verifyPin(pin: string, hashedPin: string) {
  const [salt, storedHash] = hashedPin.split("$");
  if (!salt || !storedHash) return false;
  const derived = crypto.pbkdf2Sync(pin, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(storedHash, "hex"));
}

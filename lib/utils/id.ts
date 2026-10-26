const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomChars(length: number): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/** Prefixed, human-readable id, e.g. "bk_7K2M9Q". */
export function makeId(prefix: string): string {
  return `${prefix}_${randomChars(6)}`;
}

/** Short access code shown to the user for gate/charger entry. */
export function makeAccessCode(): string {
  return `${randomChars(3)}-${randomChars(3)}`;
}

/** Paystack-shaped payment reference, e.g. "PSK_8F3A21C9". */
export function makePaymentRef(): string {
  return `PSK_${randomChars(8)}`;
}

export function makeReference(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}
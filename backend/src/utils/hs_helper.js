/**
 * Normalizes raw HS code into standard format:
 * - 8 digits: XXXX.XX.XX (e.g. 01012910 -> 0101.29.10, "0101 29 10" -> 0101.29.10)
 * - 6 digits: XXXX.XX (e.g. 010129 -> 0101.29)
 * - 4 digits: XXXX
 */
export function normalizeHsCode(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
  } else if (digits.length === 6) {
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}`;
  } else if (digits.length === 4) {
    return digits;
  }
  return null;
}

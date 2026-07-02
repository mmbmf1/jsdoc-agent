/**
 * Throws when input is invalid.
 * @param {string} input - Raw input.
 * @returns {string} Normalized input.
 * @throws {Error} When input is empty.
 */
export function normalize(input) {
  if (!input) {
    throw new Error('input is required')
  }

  return input.trim()
}

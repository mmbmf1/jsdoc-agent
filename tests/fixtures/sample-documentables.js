/**
 * Adds two numbers.
 * @param {number} a - First addend.
 * @param {number} b - Second addend.
 * @returns {number} Sum of the inputs.
 */
export function add(a, b) {
  function nestedHelper() {
    return 1
  }

  return a + b + nestedHelper()
}

/**
 * Utility container for math helpers.
 */
export class MathUtils {
  /**
   * Creates math utilities.
   * @param {number} seed - Initial seed value.
   */
  constructor(seed) {
    this.seed = seed
  }

  /**
   * Doubles the seed.
   * @returns {number} Doubled seed.
   */
  double() {
    return this.seed * 2
  }
}
/**
 * Fully documented function.
 * @param {number} x - Input value.
 * @returns {number} Doubled input.
 */
export function fullyDocumented(x) {
  return x * 2
}

/**
 * Missing @returns.
 * @param {number} x - Input value.
 */
export function missingReturns(x) {
  return x * 2
}

/**
 * Does nothing.
 * @returns {void} Nothing is returned.
 */
export function voidReturnsOnly() {}

export class WithConstructor {
  /**
   * Creates instance.
   * @param {string} name - Instance name.
   */
  constructor(name) {
    this.name = name
  }
}

/**
 * Missing @param on constructor.
 */
export class MissingConstructorParam {
  constructor(name) {
    this.name = name
  }
}

/**
 * Throws without @throws.
 * @param {number} x - Input value.
 * @returns {number} Absolute value.
 */
export function throwsWithoutTag(x) {
  if (x < 0) {
    throw new Error('negative')
  }
  return x
}

/**
 * No failure paths.
 * @param {number} x - Input value.
 * @returns {number} Absolute value.
 */
export function noThrowsNeeded(x) {
  return x >= 0 ? x : -x
}

/**
 * Utility class with description only.
 */
export class DescribedClass {}

export function noJsdocBlock() {
  return 1
}

/**
 * Fully documented helper.
 * @param {number} value - Input value.
 * @returns {number} Doubled value.
 */
export function double(value) {
  return value * 2
}

/**
 * Increments a number.
 * @returns {number} Incremented value.
 */
export function increment(value) {
  return value + 1
}

/**
 * Reads a file and may throw.
 * @param {string} filePath - Path to read.
 * @returns {Promise<string>} File contents.
 */
export async function readConfig(filePath) {
  if (!filePath) {
    throw new Error('filePath is required')
  }

  const response = await fetch(filePath)
  return response.text()
}

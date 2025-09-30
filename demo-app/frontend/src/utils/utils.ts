/**
 * will create a random color
 * @param alpha - optional alpha value to add for opacity
 * @returns an rgba color array
 */
export const getRandomColor = (alpha=1): [number, number, number, number] => {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  return [r, g, b, alpha]
}
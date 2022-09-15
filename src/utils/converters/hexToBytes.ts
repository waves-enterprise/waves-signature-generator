export const hexToBytes = (hex: string, length?: number) => {
  hex = hex.length & 1 ? `0${hex}` : hex
  if (length) {
    hex = hex.padStart(length * 2, '0')
  }
  const array = new Uint8Array(hex.length / 2)
  for (let i = 0; i < array.length; i++) {
    const j = i * 2
    array[i] = Number.parseInt(hex.slice(j, j + 2), 16)
  }
  return array
}

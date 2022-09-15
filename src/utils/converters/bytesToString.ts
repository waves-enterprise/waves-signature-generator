export const bytesToString = (bytes: Uint8Array) => {
  return new TextDecoder().decode(bytes)
}

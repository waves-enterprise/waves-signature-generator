import { numberToHex } from './numberToHex'
import { hexToBytes } from './hexToBytes'

export const numberToBytes = (num: number, length?: number) => {
  return hexToBytes(numberToHex(num), length)
}

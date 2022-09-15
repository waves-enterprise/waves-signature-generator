const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const ALPHABET_MAP = new Map(ALPHABET.split('').map((char, idx) => [char, idx]))

export const toBase58 = (buffer: Uint8Array) => {

    if (!buffer.length) {
        return ''
    }

    const digits = [0]

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < buffer.length; i++) {

        for (let j = 0; j < digits.length; j++) {
            digits[j] <<= 8
        }

        digits[0] += buffer[i]
        let carry = 0

        for (let k = 0; k < digits.length; k++) {
            digits[k] += carry
            carry = (digits[k] / 58) | 0
            digits[k] %= 58
        }

        while (carry) {
            digits.push(carry % 58)
            carry = (carry / 58) | 0
        }

    }

    for (let i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) {
        digits.push(0)
    }

    return digits.reverse().map(function (digit) {
        return ALPHABET[digit]
    }).join('')

}

export const fromBase58 = (str: string) => {

    if (!str.length) {
        return new Uint8Array(0)
    }

    const bytes = [0]

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < str.length; i++) {

        const c = str[i]
        if (!ALPHABET_MAP.has(c)) {
            throw new Error(`There is no character "${c}" in the Base58 sequence!`)
        }

        for (let j = 0; j < bytes.length; j++) {
            bytes[j] *= 58
        }

        bytes[0] += ALPHABET_MAP.get(c)!
        let carry = 0

        for (let j = 0; j < bytes.length; j++) {
            bytes[j] += carry
            carry = bytes[j] >> 8
            bytes[j] &= 0xff
        }

        while (carry) {
            bytes.push(carry & 0xff)
            carry >>= 8
        }

    }

    for (let i = 0; str[i] === '1' && i < str.length - 1; i++) {
        bytes.push(0)
    }

    return new Uint8Array(bytes.reverse())

}

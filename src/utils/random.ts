import {bytesToHex} from "./converters/bytesToHex";
import randomBytes from "@consento/sync-randombytes";
import {ShaFunction} from "../types";
import {strToBytes} from "./converters/strToBytes";

export const randomUint8Array = (length: number) => {
    return randomBytes(new Uint8Array(length))
}

export const randomUint32Array = async (sha256: ShaFunction, length: number) => {
    const a = randomUint8Array(length)
    const b = randomUint8Array(length)
    const result = new Uint32Array(length)

    for (let i = 0; i < length; i++) {
        const hash = bytesToHex(await sha256(strToBytes(`${a[i]}${b[i]}`)))
        const randomValue = parseInt(hash.slice(0, 13), 16)
        result.set([randomValue], i)
    }

    return result
}
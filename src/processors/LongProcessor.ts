import { BaseProcessor } from './BaseProcessor';
import {hexToBytes, numberToBytes} from "@wavesenterprise/crypto-utils";

export class LongProcessor extends BaseProcessor<number | string> {
    getSignatureBytes(val: number | string): Promise<Uint8Array> {
        if (typeof val === 'string') {
            return Promise.resolve(hexToBytes(val, 8))
        }
        return Promise.resolve(numberToBytes(val, 8))
    }
}

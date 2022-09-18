import {BaseProcessor} from './BaseProcessor'
import {numberToBytes} from "@wavesenterprise/crypto-utils";

export class IntProcessor extends BaseProcessor<number> {
    constructor(required: boolean = true, private length?: number) {
        super(required)
    }

    getSignatureBytes(val: number): Promise<Uint8Array> {
        return Promise.resolve(new Uint8Array(numberToBytes(val, this.length)))
    }
}

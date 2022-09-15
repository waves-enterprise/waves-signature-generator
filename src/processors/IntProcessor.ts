import {BaseProcessor} from './BaseProcessor'
import {numberToBytes} from "../utils/converters/numberToBytes";

export class IntProcessor extends BaseProcessor<number> {
    constructor(required: boolean = true) {
        super(required)
    }

    getSignatureBytes(val: number): Promise<Uint8Array> {
        return Promise.resolve(new Uint8Array(numberToBytes(val)))
    }
}

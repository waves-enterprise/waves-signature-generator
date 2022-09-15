import {concatBytes} from "../utils/concatBytes";
import {numberToBytes} from "../utils/converters/numberToBytes";
import {BaseProcessor} from "./BaseProcessor";
import {fromBase58} from "../utils/base58";

export type Base58ProcessorProps = {
    appendLength?: boolean,
    default?: string,
}

export class Base58Processor extends BaseProcessor<string> {
    constructor(required: boolean, protected readonly props: Base58ProcessorProps = {}) {
        super(required)
    }

    getSignatureBytes(val: string): Promise<Uint8Array> {
        if (!val && this.props.default !== undefined) {
            val = this.props.default
        }
        const valueBytes = fromBase58(val)
        if (this.props.appendLength) {
            const lengthBytes = numberToBytes(valueBytes.length, 2)
            return Promise.resolve(concatBytes(lengthBytes, valueBytes))
        }
        return Promise.resolve(valueBytes)
    }
}
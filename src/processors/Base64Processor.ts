import {BaseProcessor} from './BaseProcessor'
import {concatBytes, numberToBytes} from "@wavesenterprise/crypto-utils";

type Base64ProcessorProps = {
    appendLength?: boolean,
}

export class Base64Processor extends BaseProcessor<string> {
    constructor(required: boolean, protected readonly props: Base64ProcessorProps = {}) {
        super(required)
    }

    getSignatureBytes(val: string): Promise<Uint8Array> {
        const valueBytes = Buffer.from(val, 'base64')
        if (this.props.appendLength) {
            return Promise.resolve(concatBytes(numberToBytes(valueBytes.length, 2), valueBytes))
        }
        return Promise.resolve(valueBytes)
    }
}

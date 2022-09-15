import {BaseProcessor} from "./BaseProcessor";
import {strToBytes} from "../utils/converters/strToBytes";
import {concatBytes} from "../utils/concatBytes";
import {numberToBytes} from "../utils/converters/numberToBytes";

type StringProcessorProps = {
    appendLength?: boolean,
}

export class StringProcessor extends BaseProcessor<string> {
    constructor(required: boolean, protected readonly props: StringProcessorProps = {}) {
        super(required)
    }

    getSignatureBytes(val: string): Promise<Uint8Array> {
        const valueBytes = strToBytes(val)
        if (this.props.appendLength) {
            return Promise.resolve(concatBytes(numberToBytes(valueBytes.length, 2), valueBytes))
        }
        return Promise.resolve(valueBytes)
    }
}

import { BaseProcessor } from './BaseProcessor'

export class BoolProcessor extends BaseProcessor<boolean> {
    getSignatureBytes(val: boolean): Promise<Uint8Array> {
        return Promise.resolve(val ? Uint8Array.from([1]) : Uint8Array.from([0]))
    }
}

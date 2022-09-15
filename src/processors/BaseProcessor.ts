export abstract class BaseProcessor<T extends unknown = unknown> {
    public networkByte?: number

    constructor(public required = true) {
    }

    abstract getSignatureBytes(val: T): Promise<Uint8Array>

    setNetworkByte(networkByte?: number) {
        this.networkByte = networkByte
    }

    isRequired() {
        return this.required
    }

    isSpecified(val: T) {
        return val !== undefined && val !== null
    }
}
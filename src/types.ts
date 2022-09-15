export type ShaFunction = (bytes: Uint8Array) => Uint8Array | Promise<Uint8Array>
export type KeyPairBytes = {
    publicKey: Uint8Array,
    privateKey: Uint8Array,
}
export type KeyPair = {
    publicKey: string,
    privateKey: string,
}
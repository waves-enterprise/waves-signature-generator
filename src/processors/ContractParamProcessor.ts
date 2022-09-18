import { BaseProcessor } from './BaseProcessor'
import {boolToBytes, concatBytes, hexToBytes, numberToBytes, strToBytes} from "@wavesenterprise/crypto-utils";

export type ContractParameter<T extends string, Val> = {
    type: T,
    key: string,
    value: Val
}

type ContractParamString = ContractParameter<'string', string>
type ContractParamInt = ContractParameter<'integer', number>
type ContractParamBool = ContractParameter<'boolean', boolean>
type ContractParamBinary = ContractParameter<'binary', string>

export type ContractParam = ContractParamString | ContractParamBool | ContractParamInt | ContractParamBinary

const dataTypeBytes = new Map<ContractParam['type'], number>([
    ['integer', 0],
    ['boolean', 1],
    ['binary', 2],
    ['string', 3],
])

export class ContractParamProcessor extends BaseProcessor<ContractParam> {
    getSignatureBytes(val: ContractParam): Promise<Uint8Array> {
        const keyBytes = concatBytes(numberToBytes(val.key.length, 2), strToBytes(val.key))
        const typeByte = numberToBytes(dataTypeBytes.get(val.type)!)
        switch (val.type) {
            case 'string': {
                const contentBytes = strToBytes(val.value)
                const lengthBytes = numberToBytes(contentBytes.length, 4)
                return Promise.resolve(concatBytes(keyBytes, typeByte, lengthBytes, contentBytes))
            }
            case 'boolean': {
                const contentBytes = boolToBytes(val.value)
                return Promise.resolve(concatBytes(keyBytes, typeByte, contentBytes))
            }
            case 'integer': {
                const contentBytes = typeof val.value === 'number' ? numberToBytes(val.value, 8) : hexToBytes(val.value, 8)
                return Promise.resolve(concatBytes(keyBytes, typeByte, contentBytes))
            }
            case 'binary': {
                const base64Content = val.value.slice(7)
                const contentBytes = Buffer.from(base64Content, 'base64') // Buffer polyfill or something
                const lengthBytes = numberToBytes(contentBytes.length, 4)
                return Promise.resolve(concatBytes(keyBytes, typeByte, lengthBytes, contentBytes))
            }
        }
    }
}

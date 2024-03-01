import {IntProcessor} from "./IntProcessor";
import {Base58Processor} from "./Base58Processor";
import {StringProcessor} from "./StringProcessor";
import {Base64Processor} from "./Base64Processor";
import {BoolProcessor} from "./BoolProcessor";
import {BaseProcessor} from "./BaseProcessor";
import {LongProcessor} from "./LongProcessor";
import {ALIAS_VERSION} from "../consts";
import {ContractParamProcessor} from "./ContractParamProcessor";
import {ContractTransferInProcessor} from "./ContractTransferInProcessor";
import {concatBytes, fromBase58, numberToBytes, strToBytes} from "@wavesenterprise/crypto-utils";


export class TxType<T extends number> extends IntProcessor {
    constructor(required: boolean, public type: T) {
        super(required);
    }

    getSignatureBytes(_: number) {
        return Promise.resolve(Uint8Array.from([this.type]))
    }
}

export class TxVersion<T extends number> extends IntProcessor {
    constructor(required: boolean, public version: T) {
        super(required);
    }

    getSignatureBytes(_: number) {
        return Promise.resolve(Uint8Array.from([this.version]))
    }
}

export class Bool extends BoolProcessor {
}

export class Byte extends BaseProcessor<number> {
    constructor(required: boolean) {
        super(required);
    }

    getValidationError(val: number) {
        if (typeof val !== 'number') return 'You should pass a number to Byte constructor'
        if (val < 0 || val > 255) return 'Byte value must fit between 0 and 255'
        return null
    }

    getSignatureBytes(value: number) {
        return Promise.resolve(Uint8Array.from([value]))
    }
}

export class Long extends LongProcessor {
}


const INTEGER_BYTES = 4;

export class Integer extends IntProcessor {
    constructor(required) {
        super(required, INTEGER_BYTES);
    }

    getValidationError(value: number) {
        if (typeof value !== 'number') return 'You should pass a number to Integer constructor'
        if (value < -2147483648 || value > 2147483647) return 'Integer value must fit between -2147483648 and 2147483647'
        return null
    }
}

export class Base58 extends Base58Processor {
    private readonly limit?: number

    constructor(required: boolean) {
        super(required);
    }
}

export class Base58WithLength extends Base58Processor {
    private readonly limit?: number

    constructor(required: boolean, _?: number) {
        super(required, {appendLength: true});
    }
}

export class Base64 extends Base64Processor {
    constructor(required: boolean, _?: boolean) {
        super(required);
    }

    getValidationError(val: string) {
        if (typeof val !== 'string') return 'You should pass a string to BinaryDataEntry constructor'
        if (val.slice(0, 7) !== 'base64:') return 'Blob should be encoded in base64 and prefixed with "base64:"'
        return null
    }
}

export class ByteArrayWithSize extends StringProcessor {
    constructor(required: boolean, public limit?: number) {
        super(required, {appendLength: true});
    }

    getValidationError(value: Uint8Array | string) {
        if (typeof value === 'string') {
            value = strToBytes(value)
        }
        if (this.limit && value.length > this.limit) {
            return `Maximum length is exceeded: ${this.limit}`
        }
        return null
    }
}

export class ValidationProofs extends BaseProcessor<string> {
    constructor(required: boolean) {
        super(required);
    }

    getSignatureBytes(value: string) {
        return Promise.resolve(strToBytes(value))
    }
}

export class StringWithLength extends StringProcessor {
    constructor(required: boolean) {
        super(required, {appendLength: true});
    }
}

export class Attachment extends Base58Processor {
    constructor(required: boolean) {
        super(required, {appendLength: true, default: ''});
    }
}

export class Alias extends BaseProcessor<string> {
    constructor(required: boolean) {
        super(required);
    }

    getSignatureBytes(val: string): Promise<Uint8Array> {
        if (!this.networkByte) {
            throw new Error('Cannot create tx signature. Network byte is required')
        }
        const aliasBytes = strToBytes(val)
        return Promise.resolve(
            concatBytes(
                Uint8Array.from([ALIAS_VERSION]),
                Uint8Array.from([this.networkByte]),
                numberToBytes(aliasBytes.length, 2),
                aliasBytes,
            ),
        )
    }
}

export class AssetId extends Base58Processor {
    constructor(required: boolean) {
        super(required);
    }

    isSpecified(val: string) {
        return val !== undefined && val !== null && val.toLowerCase() !== 'waves'
    }
}

export class Recipient extends BaseProcessor {
    static aliasRegex = /alias:.:/i

    constructor(required: boolean) {
        super(required);
    }

    getSignatureBytes(val: string): Promise<Uint8Array> {
        if (Recipient.aliasRegex.test(val)) {
            if (!this.networkByte) {
                throw new Error('Cannot create tx signature. Network byte is required')
            }
            const alias = val.split(':').pop()!
            const aliasBytes = strToBytes(alias)
            return Promise.resolve(
                concatBytes(
                    Uint8Array.from([ALIAS_VERSION]),
                    Uint8Array.from([this.networkByte]),
                    numberToBytes(aliasBytes.length, 2),
                    aliasBytes,
                ),
            )
        } else {
            const valueBytes = fromBase58(val)
            return Promise.resolve(valueBytes)
        }
    }
}

export class Transfers extends BaseProcessor<Array<{
    recipient: string,
    amount: number | string,
}>> {
    constructor(required: boolean) {
        super(required);
    }

    async getSignatureBytes(values: Array<{
        recipient: string,
        amount: number | string,
    }>) {
        const recipientProcessor = new Base58Processor(true)
        const amountProcessor = new LongProcessor(true)

        const promises: Array<Promise<Uint8Array>> = []
        values.forEach((item) => {
            promises.push(recipientProcessor.getSignatureBytes((item).recipient))
            promises.push(amountProcessor.getSignatureBytes((item).amount))
        })

        const elements = await Promise.all(promises)

        return concatBytes(numberToBytes(values.length, 2), ...elements)
    }
}

export class PermissionTarget extends Recipient {
}

export class PermissionOpType extends BaseProcessor<'add' | 'remove'> {
    getSignatureBytes(val: 'add' | 'remove'): Promise<Uint8Array> {
        let opByte
        if (val === 'add') {
            opByte = 'a'.charCodeAt(0)
        } else {
            opByte = 'r'.charCodeAt(0)
        }
        return Promise.resolve(Uint8Array.from([opByte]))
    }
}

const RoleBytes = {
    miner: 1,
    issuer: 2,
    dex: 3,
    permissioner: 4,
    blacklister: 5,
    banned: 6,
    contract_developer: 7,
    connection_manager: 8,
    sender: 9,
    contract_validator: 10,
}

export type RoleKeys = keyof typeof RoleBytes

export class PermissionRole extends BaseProcessor<RoleKeys> {
    getSignatureBytes(val: RoleKeys): Promise<Uint8Array> {
        return Promise.resolve(Uint8Array.from([RoleBytes[val]]))
    }
}

export class PermissionDueTimestamp extends LongProcessor {
}

// DATA TRANSACTIONS ONLY
export class DockerParamEntry extends ContractParamProcessor {
    constructor(required: boolean) {
        super(required);
    }
}

export class ContractTransferIn extends ContractTransferInProcessor {
}

export class List<V = any> extends BaseProcessor<V[]> {
    static of<T>(processor: new (...args) => BaseProcessor<T>) {
        return class extends List<T> {
            constructor(_: boolean) {
                super(processor)
            }
        }
    }

    constructor(public ListItemProcessor: new (...args) => BaseProcessor<V>) {
        super(true);
    }

    async getSignatureBytes(val: V[]): Promise<Uint8Array> {
        const lengthBytes = numberToBytes(val.length, 2)
        if (val.length > 0) {
            const itemProcessor = new this.ListItemProcessor().getSignatureBytes;
            const contentBytes = await Promise.all(val.map(itemProcessor))
            return concatBytes(lengthBytes, ...contentBytes)
        }
        return new Uint8Array([0, 0])
    }
}

export class DataEntry extends ContractParamProcessor {
}

export class DataEntryMap extends List.of(DataEntry) {}

export class ArrayOfStringsWithLength extends List.of(Recipient) {
}

export type AtomicBadgeValue = {
    trustedSender?: string,
}

export class AtomicBadge extends BaseProcessor<AtomicBadgeValue> {
    getSignatureBytes(val: AtomicBadgeValue): Promise<Uint8Array> {
        if (typeof val == 'string') {
            return Promise.resolve(concatBytes(new Uint8Array([0]), fromBase58('')))
        }

        const multipleDataBytes = fromBase58(val.trustedSender ?? '')
        const lengthBytes = val.trustedSender ? new Uint8Array([1]) : new Uint8Array([0])

        return Promise.resolve(concatBytes(lengthBytes, multipleDataBytes))
    }
}

export type TAtomicInnerTransaction = {
    type: number,
    version: number,
    senderPublicKey: string,
    proofs: string[],
    id: string,
}

export class AtomicInnerTransaction extends BaseProcessor<TAtomicInnerTransaction> {
    getSignatureBytes(value: TAtomicInnerTransaction) {
        const base58 = new Base58Processor(false)

        return base58.getSignatureBytes(value.id)
    }
}

export class ContractApiVersion extends BaseProcessor<string> {
    getSignatureBytes(val: string): Promise<Uint8Array> {
        const [majorVersion, minorVersion] = val.split('.')
        const bytesMajor = numberToBytes(Number(majorVersion), 2)
        const bytesMinor = numberToBytes(Number(minorVersion), 2)
        return Promise.resolve(concatBytes(bytesMajor, bytesMinor))
    }
}

export type ValidationPolicyValue = {
    type: 'any' | 'majority' | 'majority_with_one_of',
    addresses?: string[],
}

const validationPolicyBytes = new Map<ValidationPolicyValue['type'], number>([
    ['any', 0],
    ['majority', 1],
    ['majority_with_one_of', 2],
])

export class ValidationPolicy extends BaseProcessor<ValidationPolicyValue> {
    getSignatureBytes(val: ValidationPolicyValue) {
        const {type, addresses = []} = val
        const typeByte = numberToBytes(validationPolicyBytes.get(type)!)
        if (type === 'majority_with_one_of') {
            const lengthBytes = numberToBytes(addresses.length, 2)
            const addressesBytes = addresses.map(fromBase58)
            return Promise.resolve(concatBytes(typeByte, lengthBytes, ...addressesBytes))
        }
        return Promise.resolve(typeByte)
    }
}

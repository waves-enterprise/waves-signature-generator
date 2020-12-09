import { BigNumber } from '@waves/data-entities'
import { toByteArray } from 'base64-js'
import base58 from '../libs/base58'
import convert from '../utils/convert'
import { concatUint8Arrays } from '../utils/concat'
import { DATA_ENTRIES_BYTE_LIMIT } from '../constants'
import { config } from '..'
import { ALIAS_VERSION, TRANSFER_ATTACHMENT_BYTE_LIMIT, WAVES_BLOCKCHAIN_ID, WAVES_ID } from '../constants'
import {
  PERMISSION_TRANSACTION_ROLE,
  PERMISSION_TRANSACTION_ROLE_BYTE,
  PERMISSION_TRANSACTION_OPERATION_TYPE,
  PERMISSION_TRANSACTION_OPERATION_TYPE_BYTE
} from '../constants'
import converters from '../libs/converters'

// NOTE : Waves asset ID in blockchain transactions equals to an empty string
function blockchainifyAssetId (assetId: string): string {
  if (!assetId) throw new Error('Asset ID should not be empty')
  return assetId === WAVES_ID ? WAVES_BLOCKCHAIN_ID : assetId
}

function getAliasBytes (alias: string): number[] {
  const aliasBytes = convert.stringToByteArrayWithSize(alias)
  return [ALIAS_VERSION, config.getNetworkByte(), ...aliasBytes]
}

// ABSTRACT PARENT

export abstract class ByteProcessor<T> {
  public allowNull = false
  protected constructor(public required: boolean) {}
  public abstract getBytes(val: T) : Promise<Uint8Array>
  public getValidationError(val: T) {
    return null
  }
  public getError(val: T): string | null {
    if (this.required && typeof val === 'undefined') {
      return 'field is required'
    }
    if (!this.required && !val) {
      return
    }
    return this.getValidationError(val)
  }
  isValid(val: T) {
    return !this.getError(val);
  }
}

// BASIC

export class TxType<T extends number> extends ByteProcessor<number> {
  constructor(required: boolean, public type: T) {
    super(required);
  }
  getBytes(val: number) {
    return Promise.resolve(Uint8Array.from([this.type]))
  }
}

export class TxVersion<T extends number> extends ByteProcessor<number> {
  constructor(required: boolean, public version: T) {
    super(required);
  }
  getBytes(val: number) {
    return Promise.resolve(Uint8Array.from([this.version]))
  }
}

// SIMPLE

export class Base58 extends ByteProcessor<string> {
  private readonly limit?: number
  constructor(required: boolean, limit?: number) {
    super(required);
    if (limit) {
      this.limit = limit
    }
  }
  getValidationError(value: string) {
    const bytes = base58.decode(value)
    if (this.limit && bytes.length > this.limit) {
      return `Maximum length is exceeded: ${this.limit}`
    }
    return null
  }
  public getBytes (value: string) {
    const bytes = base58.decode(value)
    return Promise.resolve(bytes)
  }
}

export class Base58WithLength extends ByteProcessor<string> {
  private readonly limit?: number
  constructor(required: boolean, limit?: number) {
    super(required);
    if (limit) {
      this.limit = limit
    }
  }
  getValidationError(value: string) {
    const bytes = base58.decode(value)
    if (this.limit && bytes.length > this.limit) {
      return `Maximum length is exceeded: ${this.limit}`
    }
    return null
  }
  getBytes (value: string) {
    const bytes = Array.from(base58.decode(value))

    const lengthBytes = converters.int16ToBytes(bytes.length, true)

    const result = Uint8Array.from([...lengthBytes, ...bytes])

    return Promise.resolve(result)
  }
}

export class Base64 extends ByteProcessor<string> {
  constructor(required: boolean) {
    super(required);
  }
  getValidationError(val: string) {
    if (typeof val !== 'string') return 'You should pass a string to BinaryDataEntry constructor'
    if (val.slice(0, 7) !== 'base64:') return 'Blob should be encoded in base64 and prefixed with "base64:"'
    return null
  }
  getBytes (value: string, byteLength: number = 2) {
    const b64 = value.slice(7) // Getting the string payload
    const bytes = Uint8Array.from(toByteArray(b64))

    let lengthBytes
    if (byteLength === 4) {
      lengthBytes = Uint8Array.from(converters.int32ToBytes(bytes.length, true))
    } else {
      // 2 bytes for the length otherwise
      lengthBytes = Uint8Array.from(convert.shortToByteArray(bytes.length))
    }
    return Promise.resolve(concatUint8Arrays(lengthBytes, bytes))
  }
}

export class Bool extends ByteProcessor<boolean> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (value: boolean) {
    const bytes = convert.booleanToBytes(value)
    return Promise.resolve(Uint8Array.from(bytes))
  }
}

export class Byte extends ByteProcessor<number> {
  constructor(required: boolean) {
    super(required);
  }
  getValidationError(val: number) {
    if (typeof val !== 'number') return 'You should pass a number to Byte constructor'
    if (val < 0 || val > 255) return 'Byte value must fit between 0 and 255'
    return null
  }
  getBytes (value: number) {
    return Promise.resolve(Uint8Array.from([value]))
  }
}

export class Long extends ByteProcessor<number | string | BigNumber> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (value: number | string | BigNumber) {
    return Promise.resolve(
      Uint8Array.from(
        convert.bigNumberToByteArray(
          new BigNumber(value)
        )
      )
    )
  }
}

export class Short extends ByteProcessor<number> {
  constructor(required: boolean) {
    super(required);
  }
  getValidationError(val: number) {
    if (typeof val !== 'number') return 'You should pass a number to Short constructor'
    if (val < 0 || val > 65535) return 'Short value must fit between 0 and 65535'
    return null
  }
  getBytes (value: number) {
    return Promise.resolve(Uint8Array.from(convert.shortToByteArray(value)))
  }
}

export class Integer extends ByteProcessor<number> {
  constructor(required: boolean) {
    super(required);
  }
  getValidationError(value: number) {
    if (typeof value !== 'number') return 'You should pass a number to Integer constructor'
    if (value < -2147483648 || value > 2147483647) return 'Integer value must fit between -2147483648 and 2147483647'
    return null
  }
  getBytes (value: number) {
    return Promise.resolve(Uint8Array.from(convert.IntToByteArray(value)))
  }
}

export class ByteArrayWithSize extends ByteProcessor<Uint8Array | string> {
  private readonly limit?: number
  constructor(required: boolean, limit?: number) {
    super(required);
    if (limit) {
      this.limit = limit
    }
  }
  getValidationError(value: Uint8Array | string) {
    if (typeof value === 'string') {
      value = Uint8Array.from(convert.stringToByteArray(value))
    }
    if (this.limit && value.length > this.limit) {
      return `Maximum length is exceeded: ${this.limit}`
    }
    return null
  }
  getBytes (value: Uint8Array | string) {
    if (typeof value === 'string') {
      value = Uint8Array.from(convert.stringToByteArray(value))
    }

    const valueWithLength = convert.bytesToByteArrayWithSize(value)
    return Promise.resolve(Uint8Array.from(valueWithLength))

  }
}

export class StringWithLength extends ByteProcessor<string> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (value: string, byteLength: number = 2) {
    const bytesWithLength = convert.stringToByteArrayWithSize(value, byteLength)
    return Promise.resolve(Uint8Array.from(bytesWithLength))
  }
}

export class Attachment extends ByteProcessor<Uint8Array | string> {
  constructor(required: boolean) {
    super(required);
  }
  getValidationError(value: Uint8Array | string) {
    if (typeof value === 'string') {
      value = Uint8Array.from(convert.stringToByteArray(value))
    }
    if (value.length > TRANSFER_ATTACHMENT_BYTE_LIMIT) {
      return 'Maximum attachment length is exceeded'
    }
    return null
  }
  getBytes (value: Uint8Array | string) {
    if (typeof value === 'string') {
      value = Uint8Array.from(convert.stringToByteArray(value))
    }

    const valueWithLength = convert.bytesToByteArrayWithSize(value)
    return Promise.resolve(Uint8Array.from(valueWithLength))

  }
}


// COMPLEX

export class Alias extends ByteProcessor<string> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (value: string) {
    const aliasBytes = getAliasBytes(value)
    const aliasBytesWithLength = convert.bytesToByteArrayWithSize(aliasBytes)
    return Promise.resolve(Uint8Array.from(aliasBytesWithLength))
  }
}

export class AssetId extends ByteProcessor<string> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (value: string) {
    value = blockchainifyAssetId(value)
    return Promise.resolve(base58.decode(value))
  }
}


export class MandatoryAssetId extends ByteProcessor<string> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (value: string) {
    value = blockchainifyAssetId(value)
    return Promise.resolve(base58.decode(value))
  }
}

export class OrderType extends ByteProcessor<string> {
  constructor(required: boolean) {
    super(required);
  }
  getValidationError(value: string) {
    if (value !== 'buy' && value !== 'sell') {
      return 'There are no other order types besides "buy" and "sell"'
    }
    return null
  }
  getBytes (value: string) {
    if (value === 'buy') {
      return Bool.prototype.getBytes.call(this, false)
    } else if (value === 'sell') {
      return Bool.prototype.getBytes.call(this, true)
    }
  }
}

export class Recipient extends ByteProcessor<string> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (value: string) {
    if (/alias:.:/i.test(value)) {
      const aliasBytes = getAliasBytes(value.split(':').pop())
      return Promise.resolve(Uint8Array.from(aliasBytes))
    } else {
      const addressBytes = base58.decode(value)
      return Promise.resolve(Uint8Array.from(addressBytes))
    }
  }
}

export class Transfers extends ByteProcessor<any> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (values) {
    const recipientProcessor = new Recipient(true)
    const amountProcessor = new Long(true)

    const promises = []
    for (let i = 0; i < values.length; i++) {
      promises.push(recipientProcessor.getBytes(values[i].recipient))
      promises.push(amountProcessor.getBytes(values[i].amount))
    }

    return Promise.all(promises).then((elements) => {
      const length = convert.shortToByteArray(values.length)
      const lengthBytes = Uint8Array.from(length)
      return concatUint8Arrays(lengthBytes, ...elements)
    })
  }
}

// PERMISSIONS
export class PermissionTarget extends ByteProcessor<string> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (value: string) {
    const addressBytes = base58.decode(value)
    return Promise.resolve(Uint8Array.from(addressBytes))
  }
}

// opType: "a" or "r" (byte)
export class PermissionOpType extends ByteProcessor<string> {
  constructor(required: boolean) {
    super(required);
  }
  getValidationError(value: string) {
    if (value === PERMISSION_TRANSACTION_OPERATION_TYPE.ADD || value === PERMISSION_TRANSACTION_OPERATION_TYPE.REMOVE) {
      return null
    } else {
      return `Unknown permission operation type: ${value}`
    }
  }
  getBytes (value: string) {
    let opByte
    if (value === PERMISSION_TRANSACTION_OPERATION_TYPE.ADD) {
      opByte = PERMISSION_TRANSACTION_OPERATION_TYPE_BYTE.ADD
    } else if (value === PERMISSION_TRANSACTION_OPERATION_TYPE.REMOVE) {
      opByte = PERMISSION_TRANSACTION_OPERATION_TYPE_BYTE.REMOVE
    }
    return Promise.resolve(Uint8Array.from([opByte]))
  }
}

// role: 1-6 (byte)
export class PermissionRole extends ByteProcessor<string> {
  constructor(required: boolean) {
    super(required);
  }
  getValidationError(value: string) {
    const roleKey = Object.keys(PERMISSION_TRANSACTION_ROLE)
      .find(k => PERMISSION_TRANSACTION_ROLE[k] === value)
    if (!roleKey) {
      return `Permission role ${value} not found`
    }
    return null
  }
  getBytes (value: string) {
    const roleKey = Object.keys(PERMISSION_TRANSACTION_ROLE)
      .find(k => PERMISSION_TRANSACTION_ROLE[k] === value)

    const roleByte = PERMISSION_TRANSACTION_ROLE_BYTE[roleKey]
    return Promise.resolve(Uint8Array.from([roleByte]))
  }
}

// dueTimestamp: 0 + 0 * sizeOfLong | 1 + dueTimestamp.toBytes
export class PermissionDueTimestamp extends ByteProcessor<number | string | BigNumber> {
  constructor(required: boolean) {
    super(required);
    this.allowNull = true
  }
  getBytes (value: number | string | BigNumber) {
    // no due timestamp specified
    if (!+value || isNaN(+value)) {
      const emptyDueTimestamp = Uint8Array.from(new Array(9).fill(0))
      return Promise.resolve(emptyDueTimestamp)
    }

    let bytes

    if (typeof value === 'number') {
      bytes = convert.longToByteArray(value)
    } else {
      if (typeof value === 'string') {
        value = new BigNumber(value)
      }
      bytes = convert.bigNumberToByteArray(value)
    }

    return Promise.resolve(Uint8Array.from([1, ...bytes]))
  }
}

export interface PermissionOptionsType {
  opType: PERMISSION_TRANSACTION_OPERATION_TYPE | string,
  role: string,
  dueTimestamp?: number | string // любое число
  timestamp: number | string | BigNumber
}

export class PermissionOptions extends ByteProcessor<PermissionOptionsType> {
  constructor(required: boolean) {
    super(required);
  }
  getValidationError(value: PermissionOptionsType) {
    return (new PermissionOpType(true)).getValidationError(value.opType)
    || (new PermissionRole(true)).getValidationError(value.role)
    || (new PermissionDueTimestamp(false)).getValidationError(value.dueTimestamp)
    || (new Long(true)).getValidationError(value.timestamp)
  }
  async getBytes (value: PermissionOptionsType) {
    const multipleDataBytes = await Promise.all([
      (new PermissionOpType(true)).getBytes(value.opType),
      (new PermissionRole(true)).getBytes(value.role),
      (new Long(true)).getBytes(value.timestamp),
      (new PermissionDueTimestamp(false)).getBytes(value.dueTimestamp),
    ])
    return concatUint8Arrays(...multipleDataBytes)
  }
}

// DATA TRANSACTIONS ONLY

const INTEGER_DATA_TYPE = 0
const BOOLEAN_DATA_TYPE = 1
const BINARY_DATA_TYPE = 2
const STRING_DATA_TYPE = 3

export class IntegerDataEntry extends ByteProcessor<number | string | BigNumber> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (value: number | string | BigNumber) {
    return Long.prototype.getBytes.call(this, value).then((longBytes) => {
      const typeByte = Uint8Array.from([INTEGER_DATA_TYPE])
      return concatUint8Arrays(typeByte, longBytes)
    })
  }
}

export class BooleanDataEntry extends ByteProcessor<boolean> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (value: boolean) {
    return Bool.prototype.getBytes.call(this, value).then((boolByte) => {
      const typeByte = Uint8Array.from([BOOLEAN_DATA_TYPE])
      return concatUint8Arrays(typeByte, boolByte)
    })
  }
}

export class BinaryDataEntry extends ByteProcessor<string> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (value: string) {
    return Base64.prototype.getBytes.call(this, value).then((binaryBytes) => {
      const typeByte = Uint8Array.from([BINARY_DATA_TYPE])
      return Promise.resolve(concatUint8Arrays(typeByte, binaryBytes))
    })
  }
}

export class StringDataEntry extends ByteProcessor<string> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (value: string) {
    return StringWithLength.prototype.getBytes.call(this, value).then((stringBytes) => {
      const typeByte = Uint8Array.from([STRING_DATA_TYPE])
      return concatUint8Arrays(typeByte, stringBytes)
    })
  }
}

export class BinaryDockerParamEntry extends ByteProcessor<string> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (value: string) {
    return Base64.prototype.getBytes.call(this, value, 4).then((binaryBytes) => {
      const typeByte = Uint8Array.from([BINARY_DATA_TYPE])
      return Promise.resolve(concatUint8Arrays(typeByte, binaryBytes))
    })
  }
}

export class StringDockerParamEntry extends ByteProcessor<string> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (value: string) {
    return StringWithLength.prototype.getBytes.call(this, value, 4).then((stringBytes) => {
      const typeByte = Uint8Array.from([STRING_DATA_TYPE])
      return concatUint8Arrays(typeByte, stringBytes)
    })
  }
}

export class DockerParamEntry extends ByteProcessor<any[]> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (entry: any) {
    const prependKeyBytes = (valueBytes) => {
      return StringWithLength.prototype.getBytes.call(this, entry.key).then((keyBytes) => {
        return concatUint8Arrays(keyBytes, valueBytes)
      })
    }

    switch (entry.type) {
      case 'integer':
        return IntegerDataEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
      case 'boolean':
        return BooleanDataEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
      // for docker tx data entries string and binary types have 4 byte length
      case 'binary':
        return BinaryDockerParamEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
      case 'string':
        return StringDockerParamEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
      default:
        throw new Error(`There is no data type "${entry.type}"`)
    }
  }
}

export class List extends ByteProcessor<any[]> {
  public entityVal: ByteProcessor<any>;
  constructor(public entityClass: new (...args) => ByteProcessor<any>) {
    super(false);
    this.allowNull = true;
    this.entityVal = new entityClass();
  }
  getBytes (entries: any[] = []) {
    const lengthBytes = Uint8Array.from(convert.shortToByteArray(entries.length))
    if (entries.length) {
      return Promise.all(entries.map(this.entityVal.getBytes)).then((entriesBytes) => {
        const bytes = concatUint8Arrays(lengthBytes, ...entriesBytes)
        if (bytes.length > DATA_ENTRIES_BYTE_LIMIT) throw new Error('Data transaction is too large (140KB max)')
        return bytes
      })
    } else {
      return Promise.resolve(Uint8Array.from([0, 0]))
    }
  }
}

export class DataEntry extends ByteProcessor<any[]> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (entry: any) {
    const prependKeyBytes = (valueBytes) => {
      return StringWithLength.prototype.getBytes.call(this, entry.key).then((keyBytes) => {
        return concatUint8Arrays(keyBytes, valueBytes)
      })
    }

    switch (entry.type) {
      case 'integer':
        return IntegerDataEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
      case 'boolean':
        return BooleanDataEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
      case 'binary':
        return BinaryDataEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
      case 'string':
        return StringDataEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
      default:
        throw new Error(`There is no data type "${entry.type}"`)
    }
  }
}

export class DataEntries extends ByteProcessor<any[]> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (entries: any[]) {
    const lengthBytes = Uint8Array.from(convert.shortToByteArray(entries.length))
    if (entries.length) {
      return Promise.all(entries.map((entry) => {
        const prependKeyBytes = (valueBytes) => {
          return StringWithLength.prototype.getBytes.call(this, entry.key).then((keyBytes) => {
            return concatUint8Arrays(keyBytes, valueBytes)
          })
        }

        switch (entry.type) {
          case 'integer':
            return IntegerDataEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
          case 'boolean':
            return BooleanDataEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
          case 'binary':
            return BinaryDataEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
          case 'string':
            return StringDataEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
          default:
            throw new Error(`There is no data type "${entry.type}"`)
        }
      })).then((entriesBytes) => {
        const bytes = concatUint8Arrays(lengthBytes, ...entriesBytes)
        if (bytes.length > DATA_ENTRIES_BYTE_LIMIT) throw new Error('Data transaction is too large (140KB max)')
        return bytes
      })
    } else {
      return Promise.resolve(Uint8Array.from([0, 0]))
    }
  }
}

/*
same as data tx except for string and binary entries - they have 4 bytes length (instead of 2 bytes in data tx)
* */

/* todo rename to DockerParamsEntries*/
export class DockerCreateParamsEntries extends ByteProcessor<any[]> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (entries: any[]) {
    const lengthBytes = Uint8Array.from(convert.shortToByteArray(entries.length))
    if (entries.length) {
      return Promise.all(entries.map((entry) => {
        const prependKeyBytes = (valueBytes) => {
          return StringWithLength.prototype.getBytes.call(this, entry.key).then((keyBytes) => {
            return concatUint8Arrays(keyBytes, valueBytes)
          })
        }

        switch (entry.type) {
          case 'integer':
            return IntegerDataEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
          case 'boolean':
            return BooleanDataEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
          // for docker tx data entries string and binary types have 4 byte length
          case 'binary':
            return BinaryDockerParamEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
          case 'string':
            return StringDockerParamEntry.prototype.getBytes.call(this, entry.value).then(prependKeyBytes)
          default:
            throw new Error(`There is no data type "${entry.type}"`)
        }
      })).then((entriesBytes) => {
        const bytes = concatUint8Arrays(lengthBytes, ...entriesBytes)
        if (bytes.length > DATA_ENTRIES_BYTE_LIMIT) throw new Error('Data transaction is too large (140KB max)')
        return bytes
      })
    } else {
      return Promise.resolve(Uint8Array.from([0, 0]))
    }
  }
}

export class ArrayOfStringsWithLength extends ByteProcessor<any> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (values) {
    const recipientProcessor = new Recipient(true)
    const promises = []
    for (let i = 0; i < values.length; i++) {
      promises.push(recipientProcessor.getBytes(values[i]))
    }

    return Promise.all(promises).then((elements) => {
      if (values.length === 0) {
        return Uint8Array.from([0, 0, 0, 0])
      }

      const length = convert.IntToByteArray(values.length)
      const lengthBytes = Uint8Array.from(length)
      return concatUint8Arrays(lengthBytes, ...elements)
    })
  }
}

export interface AtomicBadgeValue {
  trustedSender?: string
}

export class AtomicBadge extends ByteProcessor<AtomicBadgeValue> {
  constructor(required: boolean) {
    super(required);
  }

  async getBytes (value: AtomicBadgeValue) {
    const multipleDataBytes = await Promise.all([
      (new Base58(false)).getBytes(value.trustedSender)
    ])
    const lengthBytes = value.trustedSender ? Uint8Array.from([1]) : Uint8Array.from([0])
    return concatUint8Arrays(lengthBytes, ...multipleDataBytes)
  }
}

export interface AtomicInnerTransactionsValue {
  senderPublicKey?: string;
  atomicBadge: AtomicBadgeValue;
}

export class AtomicInnerTransactions extends ByteProcessor<any[]> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (txs: any[]) {
    const lengthBytes = Uint8Array.from(convert.shortToByteArray(txs.length))
    return Promise.all(txs.map(async (tx) => {
      const idBytes = await (new Base58(true)).getBytes(tx.id)
      return idBytes
    })).then((txsBytes) => {
      const res = concatUint8Arrays(lengthBytes, ...txsBytes)
      return res
    })
  }
}

export class AtomicInnerTransaction extends ByteProcessor<any[]> {
  constructor(required: boolean) {
    super(required);
  }
  getBytes (tx: any) {
    return (new Base58(true)).getBytes(tx.id)
  }
}

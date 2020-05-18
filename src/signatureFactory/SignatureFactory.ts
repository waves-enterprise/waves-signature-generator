import {
  Alias,
  AssetId,
  Attachment,
  Base58,
  Base58WithLength,
  Base64,
  Bool,
  Byte,
  ByteProcessor,
  DataEntries,
  DockerCreateParamsEntries,
  IDATA_PROPS,
  IMASS_TRANSFER_PROPS,
  ISET_SCRIPT_PROPS,
  ISPONSORSHIP_PROPS,
  Long,
  Integer,
  MandatoryAssetId,
  OrderType,
  Recipient,
  StringWithLength,
  ArrayOfStringsWithLength,
  Transfers,
  PermissionTarget,
  PermissionOpType,
  PermissionRole,
  PermissionDueTimestamp,
  IDOCKERCREATE_PROPS,
  IDOCKERCALL_PROPS,
  IDOCKERCALL_V2_PROPS,
  IDOCKERDISABLE_PROPS,
  IPOLICY_UPDATE_PROPS,
  IPOLICY_CREATE_PROPS,
  IPOLICY_REGISTER_NODE_PROPS,
  IDOCKERCREATE_V2_PROPS
} from '..'
import {
  IPERMIT_PROPS,
  IBURN_PROPS, ICANCEL_LEASING_PROPS, ICANCEL_ORDER_PROPS, ICREATE_ALIAS_PROPS, IDEFAULT_PROPS,
  IISSUE_PROPS, ILEASE_PROPS, IORDER_PROPS, IREISSUE_PROPS,
  ISignatureGenerator,
  ISignatureGeneratorConstructor, ITRANSFER_PROPS,
  TTX_NUMBER_MAP,
  TTX_TYPE_MAP
} from './interface'
import { concatUint8Arrays } from '../utils/concat'
import cryptoGost from '../utils/cryptoGost'
import crypto from '../utils/crypto'
import { config } from '../config/Config'
import * as constants from '../constants'
import base58 from '../libs/base58'

export function generate<T> (fields: Array<ByteProcessor | number>): ISignatureGeneratorConstructor<T> {

  if (!fields || !fields.length) {
    throw new Error('It is not possible to create TransactionClass without fields')
  }

  // Fields of the original data object
  const storedFields: object = Object.create(null)

  // Data bytes or functions returning data bytes via promises
  const byteProviders: Array<Function | Uint8Array> = []

  fields.forEach(function (field: ByteProcessor) {
    if (field instanceof ByteProcessor) {
      // Remember user data fields
      storedFields[field.name] = field
      // All user data must be represented as bytes
      byteProviders.push((data) => field.process(data[field.name]))
    } else if (typeof field === 'number') {
      // All static data must be converted to bytes as well
      byteProviders.push(Uint8Array.from([field]))
    } else {
      throw new Error('Invalid field is passed to the createTransactionClass function')
    }
  })

  class SignatureGenerator implements ISignatureGenerator {

    // Array of Uint8Array and promises which return Uint8Array
    private readonly _dataHolders: Array<Uint8Array | Promise<Uint8Array>>
    // Request data provided by user
    private readonly _rawData: object

    constructor (hashMap: any = {}) {

      // Save all needed values from user data
      this._rawData = Object.keys(storedFields).reduce((store, key) => {
        store[key] = hashMap[key]
        return store
      }, {})

      this._dataHolders = byteProviders.map((provider) => {
        if (typeof provider === 'function') {
          // Execute function so that they return promises containing Uint8Array data
          return provider(this._rawData)
        } else {
          // Or just pass Uint8Array data
          return provider
        }
      })
    }

    public getSignature (privateKey: string, isGost: boolean = true): Promise<string> {
      return this.getBytes().then((dataBytes) => {
        return config.isCryptoGost()
          ? cryptoGost.buildTransactionSignature(dataBytes, privateKey)
          : crypto.buildTransactionSignature(dataBytes, privateKey)
      })
    }

    // Get byte representation of the transaction
    public getBytes (): Promise<Uint8Array> {
      return Promise.all(this._dataHolders).then((multipleDataBytes: Uint8Array[]) => {
        if (multipleDataBytes.length === 1) {
          return multipleDataBytes[0]
        } else {
          return concatUint8Arrays(...multipleDataBytes)
        }
      })
    }

    public getDebugBytes () {
      return Promise.all(fields.map((field: any, i) => {
        const result = this._dataHolders[i]
        if (result instanceof Promise) {
          return result.then(bytes => {
            return {bytes, from: field && field.name || field}
          })
        } else {
          return Promise.resolve({bytes: result, from: field})
        }
      }))
    }

    // Get bytes of an exact field from user data
    public getExactBytes (fieldName: string): Promise<Uint8Array> {

      if (!(fieldName in storedFields)) {
        throw new Error(`There is no field '${fieldName}' in 'RequestDataType class`)
      }

      const byteProcessor = storedFields[fieldName]
      const userData = this._rawData[fieldName]
      return byteProcessor.process(userData)
    }

  }

  return SignatureGenerator
}

export const TX_NUMBER_MAP: TTX_NUMBER_MAP = Object.create(null)
export const TX_TYPE_MAP: TTX_TYPE_MAP = Object.create(null)

export const CREATE_ORDER_SIGNATURE = generate<IORDER_PROPS>([
  new Base58('senderPublicKey'),
  new Base58('matcherPublicKey'),
  new AssetId('amountAsset'),
  new AssetId('priceAsset'),
  new OrderType('orderType'),
  new Long('price'),
  new Long('amount'),
  new Long('timestamp'),
  new Long('expiration'),
  new Long('matcherFee')
])

export const AUTH_ORDER_SIGNATURE = generate<IDEFAULT_PROPS>([
  new Base58('senderPublicKey'),
  new Long('timestamp')
])

export const CANCEL_ORDER_SIGNATURE = generate<ICANCEL_ORDER_PROPS>([
  new Base58('senderPublicKey'),
  new Base58('orderId')
])

/*
1) typeId: 102 (byte)
2) version: 1 (byte)
3) senderPublicKey: 64 bytes
4) target: Address or Alias bytes
5) timestamp.toBytes
6) PermissionOp bytes:
	6.1) opType: "a" or "r" (byte)
	6.2) role: 1-6 (byte)
	6.3) timestamp.toBytes
	6.4) dueTimestamp: 0 + 0 * sizeOfLong | 1 + dueTimestamp.toBytes
*/
const PERMIT = generate<IPERMIT_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.PERMIT,
  constants.TRANSACTION_TYPE_VERSION.PERMIT,
  new Base58('senderPublicKey'),
  new PermissionTarget('target'),
  new Long('timestamp'),
  new Long('fee'),
  new PermissionOpType('opType'),
  new PermissionRole('role'),
  new Long('timestamp'),
  new PermissionDueTimestamp('dueTimestamp')
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.PERMIT] = PERMIT
TX_TYPE_MAP[constants.TRANSACTION_TYPE.PERMIT] = PERMIT

const ISSUE = generate<IISSUE_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.ISSUE,
  constants.TRANSACTION_TYPE_VERSION.ISSUE,
  new Byte('chainId'),
  new Base58('senderPublicKey'),
  new StringWithLength('name'),
  new StringWithLength('description'),
  new Long('quantity'),
  new Byte('precision'),
  new Bool('reissuable'),
  new Long('fee'),
  new Long('timestamp'),
  1, // 1 - if script exists, and 0 if there's no script
  new Base64('script') // Byte for script smart assets.
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.ISSUE] = ISSUE
TX_TYPE_MAP[constants.TRANSACTION_TYPE.ISSUE] = ISSUE

const TRANSFER = generate<ITRANSFER_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.TRANSFER,
  constants.TRANSACTION_TYPE_VERSION.TRANSFER,
  new Base58('senderPublicKey'),
  new AssetId('assetId'),
  new AssetId('feeAssetId'),
  new Long('timestamp'),
  new Long('amount'),
  new Long('fee'),
  new Recipient('recipient'),
  new Attachment('attachment')
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.TRANSFER] = TRANSFER
TX_TYPE_MAP[constants.TRANSACTION_TYPE.TRANSFER] = TRANSFER

const REISSUE = generate<IREISSUE_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.REISSUE,
  constants.TRANSACTION_TYPE_VERSION.REISSUE,
  new Byte('chainId'),
  new Base58('senderPublicKey'),
  new MandatoryAssetId('assetId'),
  new Long('quantity'),
  new Bool('reissuable'),
  new Long('fee'),
  new Long('timestamp')
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.REISSUE] = REISSUE
TX_TYPE_MAP[constants.TRANSACTION_TYPE.REISSUE] = REISSUE

const BURN = generate<IBURN_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.BURN,
  constants.TRANSACTION_TYPE_VERSION.BURN,
  new Byte('chainId'),
  new Base58('senderPublicKey'),
  new MandatoryAssetId('assetId'),
  new Long('quantity'),
  new Long('fee'),
  new Long('timestamp')
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.BURN] = BURN
TX_TYPE_MAP[constants.TRANSACTION_TYPE.BURN] = BURN

const LEASE = generate<ILEASE_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.LEASE,
  constants.TRANSACTION_TYPE_VERSION.LEASE,
  0, // Asset id for lease custom asset (dos't work)
  new Base58('senderPublicKey'),
  new Recipient('recipient'),
  new Long('amount'),
  new Long('fee'),
  new Long('timestamp')
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.LEASE] = LEASE
TX_TYPE_MAP[constants.TRANSACTION_TYPE.LEASE] = LEASE

const CANCEL_LEASING = generate<ICANCEL_LEASING_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.CANCEL_LEASING,
  constants.TRANSACTION_TYPE_VERSION.CANCEL_LEASING,
  new Byte('chainId'),
  new Base58('senderPublicKey'),
  new Long('fee'),
  new Long('timestamp'),
  new Base58('leaseId')
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.CANCEL_LEASING] = CANCEL_LEASING
TX_TYPE_MAP[constants.TRANSACTION_TYPE.CANCEL_LEASING] = CANCEL_LEASING

const CREATE_ALIAS = generate<ICREATE_ALIAS_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.CREATE_ALIAS,
  constants.TRANSACTION_TYPE_VERSION.CREATE_ALIAS,
  new Base58('senderPublicKey'),
  new Alias('alias'),
  new Long('fee'),
  new Long('timestamp')
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.CREATE_ALIAS] = CREATE_ALIAS
TX_TYPE_MAP[constants.TRANSACTION_TYPE.CREATE_ALIAS] = CREATE_ALIAS

const MASS_TRANSFER = generate<IMASS_TRANSFER_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.MASS_TRANSFER,
  constants.TRANSACTION_TYPE_VERSION.MASS_TRANSFER,
  new Base58('senderPublicKey'),
  new AssetId('assetId'),
  new Transfers('transfers'),
  new Long('timestamp'),
  new Long('fee'),
  new Attachment('attachment')
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.MASS_TRANSFER] = MASS_TRANSFER
TX_TYPE_MAP[constants.TRANSACTION_TYPE.MASS_TRANSFER] = MASS_TRANSFER

const DATA = generate<IDATA_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.DATA,
  constants.TRANSACTION_TYPE_VERSION.DATA,
  new Base58('senderPublicKey'),
  new Base58('authorPublicKey'),
  new DataEntries('data'),
  new Long('timestamp'),
  new Long('fee')
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.DATA] = DATA
TX_TYPE_MAP[constants.TRANSACTION_TYPE.DATA] = DATA

const SET_SCRIPT = generate<ISET_SCRIPT_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.SET_SCRIPT,
  constants.TRANSACTION_TYPE_VERSION.SET_SCRIPT,
  new Byte('chainId'),
  new Base58('senderPublicKey'),
  constants.SET_SCRIPT_LANG_VERSION,
  new Base64('script'),
  new StringWithLength('name'),
  new StringWithLength('description'),
  new Long('fee'),
  new Long('timestamp')
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.SET_SCRIPT] = SET_SCRIPT
TX_TYPE_MAP[constants.TRANSACTION_TYPE.SET_SCRIPT] = SET_SCRIPT

const SPONSORSHIP = generate<ISPONSORSHIP_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.SPONSORSHIP,
  constants.TRANSACTION_TYPE_VERSION.SPONSORSHIP,
  new Base58('senderPublicKey'),
  new Base58('assetId'), // Not the AssetId byte processor
  new Long('minSponsoredAssetFee'),
  new Long('fee'),
  new Long('timestamp')
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.SPONSORSHIP] = SPONSORSHIP
TX_TYPE_MAP[constants.TRANSACTION_TYPE.SPONSORSHIP] = SPONSORSHIP

// Docker txs

const DOCKER_CREATE = generate<IDOCKERCREATE_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.DOCKER_CREATE,
  constants.TRANSACTION_TYPE_VERSION.DOCKER_CREATE,
  new Base58('senderPublicKey'),
  new StringWithLength('image'),
  new StringWithLength('imageHash'),
  new StringWithLength('contractName'),
  new DockerCreateParamsEntries('params'),
  new Long('fee'),
  new Long('timestamp')
]);

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.DOCKER_CREATE] = DOCKER_CREATE;
TX_TYPE_MAP[constants.TRANSACTION_TYPE.DOCKER_CREATE] = DOCKER_CREATE;

const DOCKER_CREATE_V2 = generate<IDOCKERCREATE_V2_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.DOCKER_CREATE,
  constants.TRANSACTION_TYPE_VERSION.DOCKER_CREATE_V2,
  new Base58('senderPublicKey'),
  new StringWithLength('image'),
  new StringWithLength('imageHash'),
  new StringWithLength('contractName'),
  new DockerCreateParamsEntries('params'),
  new Long('fee'),
  new Long('timestamp'),
  new AssetId('feeAssetId')
]);

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.DOCKER_CREATE_V2] = DOCKER_CREATE_V2;
TX_TYPE_MAP[constants.TRANSACTION_TYPE.DOCKER_CREATE_V2] = DOCKER_CREATE_V2;

const DOCKER_CALL = generate<IDOCKERCALL_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.DOCKER_CALL,
  constants.TRANSACTION_TYPE_VERSION.DOCKER_CALL,
  new Base58('senderPublicKey'),
  new Base58WithLength('contractId'),
  new DockerCreateParamsEntries('params'),
  new Long('fee'),
  new Long('timestamp')
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.DOCKER_CALL] = DOCKER_CALL
TX_TYPE_MAP[constants.TRANSACTION_TYPE.DOCKER_CALL] = DOCKER_CALL

const DOCKER_CALL_V2 = generate<IDOCKERCALL_V2_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.DOCKER_CALL_V2,
  constants.TRANSACTION_TYPE_VERSION.DOCKER_CALL_V2,
  new Base58('senderPublicKey'),
  new Base58WithLength('contractId'),
  new DockerCreateParamsEntries('params'),
  new Long('fee'),
  new Long('timestamp'),
  new Integer('contractVersion'),
  new AssetId('feeAssetId'),
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.DOCKER_CALL_V2] = DOCKER_CALL_V2
TX_TYPE_MAP[constants.TRANSACTION_TYPE.DOCKER_CALL_V2] = DOCKER_CALL_V2

const DOCKER_DISABLE = generate<IDOCKERDISABLE_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.DOCKER_DISABLE,
  constants.TRANSACTION_TYPE_VERSION.DOCKER_DISABLE,
  new Base58('senderPublicKey'),
  new Base58WithLength('contractId'),
  new Long('fee'),
  new Long('timestamp')
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.DOCKER_DISABLE] = DOCKER_DISABLE
TX_TYPE_MAP[constants.TRANSACTION_TYPE.DOCKER_DISABLE] = DOCKER_DISABLE

// Policy txs

const POLICY_REGISTER_NODE = generate<IPOLICY_REGISTER_NODE_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.POLICY_REGISTER_NODE,
  constants.TRANSACTION_TYPE_VERSION.POLICY_REGISTER_NODE,
  new Base58('senderPublicKey'),
  new Base58('targetPubKey'),
  new StringWithLength('nodeName'),
  new PermissionOpType('opType'),
  new Long('timestamp'),
  new Long('fee'),
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.POLICY_REGISTER_NODE] = POLICY_REGISTER_NODE
TX_TYPE_MAP[constants.TRANSACTION_TYPE.POLICY_REGISTER_NODE] = POLICY_REGISTER_NODE

/**
 * recipients and owners serialization for policy create nd policy update txs
 *
 * def serializeAddresses(addresses: List[Address]): Array[Byte] = {
    val sizeArray = Ints.toByteArray(addresses.size)
    val dataArray = addresses.map(_.bytes.arr).fold(Array.empty[Byte]) { case (res, next) => Bytes.concat(res, next) }
    Bytes.concat(sizeArray, dataArray)
  }
 */

const POLICY_CREATE = generate<IPOLICY_CREATE_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.POLICY_CREATE,
  constants.TRANSACTION_TYPE_VERSION.POLICY_CREATE,
  new Base58('senderPublicKey'),
  new StringWithLength('policyName'),
  new StringWithLength('description'),
  new ArrayOfStringsWithLength('recipients'),
  new ArrayOfStringsWithLength('owners'),
  new Long('timestamp'),
  new Long('fee'),
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.POLICY_CREATE] = POLICY_CREATE
TX_TYPE_MAP[constants.TRANSACTION_TYPE.POLICY_CREATE] = POLICY_CREATE

const POLICY_UPDATE = generate<IPOLICY_UPDATE_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.POLICY_UPDATE,
  constants.TRANSACTION_TYPE_VERSION.POLICY_UPDATE,
  new Base58('senderPublicKey'),
  new Base58WithLength('policyId'),
  new ArrayOfStringsWithLength('recipients'),
  new ArrayOfStringsWithLength('owners'),
  new PermissionOpType('opType'),
  new Long('timestamp'),
  new Long('fee'),
])

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.POLICY_UPDATE] = POLICY_UPDATE
TX_TYPE_MAP[constants.TRANSACTION_TYPE.POLICY_UPDATE] = POLICY_UPDATE

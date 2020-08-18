import {
  ByteProcessor,
  TxType,
  TxVersion
} from '..'


export interface Processor {
  getBytes() : Uint8Array
  isValid() : boolean
  getErrors() : string[] | null
}

type TransactionFields =
  {tx_type: TxType<any>, version: TxVersion<any>} & Record<string, ByteProcessor<any>>

type getTxType <T> =
  { [key in keyof T]?: T[key] extends ByteProcessor<infer P> ? P : never }

type Transaction<T> = getTxType<T> & Processor

export const getTransactionsFactory = <T extends TransactionFields> (val: T) =>
  (tx?: Partial<getTxType<T>>): Transaction<T> => {
    return {
      ...tx,
      version: val.version.version,
      tx_type: val.tx_type.type,
      getBytes : () => {
        return Uint8Array.from([])
      },
      isValid : () => {
        return !this.getErrors().length
      },
      getErrors(): string[] | null {
        return [].concat(...Object.keys(val).map(key => {
          const error = val[key].getError(this[key])
          return error ? `${key}: ${error}` : null
        }).filter(Boolean))
      }
    } as Transaction<T>
  }
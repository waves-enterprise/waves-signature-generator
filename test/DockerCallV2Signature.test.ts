import { config, TRANSACTION_TYPE, TX_TYPE_MAP } from "../src";
import crypto from "../src/utils/crypto";
import * as moment from "moment";

enum ParamType {
  string= 'string',
  number = 'number',
  boolean = 'boolean',
}

interface IParam {
  type: ParamType;
  key: string;
  value: string | number | boolean;
}

const DateFormat = 'dd-MM-YYYY HH:mm';

function isDateInstance(value: any) {
  return value instanceof Date && !isNaN(value.valueOf())
}

const transformParam = (key: string, value: string | object | Date) => {
  if (typeof value === 'string') {
    return {
      type: ParamType.string,
      key,
      value
    }
  }
  if (isDateInstance(value)) {
    return {
      type: ParamType.string,
      key,
      value: moment(value).format(DateFormat)
    }
  }
  if (Array.isArray(value)) {
    return {
      type: ParamType.string,
      key,
      value: JSON.stringify(value)
    }
  }
  throw new Error(`An unknown error occurred`);
};

const object = {
  proofs: ["4ru1UaK72D1AEfsL6vRRkWkCENG2GHwJ3GwN8fLH2rtzszzXLTkwix1QtsZ1sbn5zD71vrF1mkNnNTEtho6ahy1"],
}

describe('', () => {
  beforeEach(() => {
    config.set({networkByte: 84, crypto: 'waves'})
  });

  test('test', async () => {
    const keyPair = {
      privateKey: "7WrispiP5zx5cqtmL7Chqc7bQiY7MES5G8VQeJfEDWgk",
      publicKey: "Aygym4ebKfyq4Qv4LELiDEttukt6fgBJZJhPmkFrbh7z"
    };
    const params = [];
    const dockerCallMock = {
      senderPublicKey: keyPair.publicKey,
      timestamp: 1589802312627,
      contractId: "9f3Z7TjvY5sCBvFSo4xeiww2ULYWDx5Xuh3u7ow3AKau",
      contractVersion: 1,
      params: [],
      fee: '10000000'
    };
    const signatureGenerator = new TX_TYPE_MAP[TRANSACTION_TYPE.DOCKER_CALL_V2](dockerCallMock);
    const bytes = await signatureGenerator.getBytes();
    const bytes2 = Int8Array.from(bytes)
    console.log(JSON.stringify(Array.from(bytes2)));
    const signature = await signatureGenerator.getSignature(keyPair.privateKey);
    const isSignatureValid = crypto.isValidSignature(bytes, signature, keyPair.publicKey);
    expect(isSignatureValid).toBeTruthy()
  })
});

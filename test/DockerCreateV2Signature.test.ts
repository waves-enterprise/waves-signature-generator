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

describe('', () => {
  beforeEach(() => {
    config.set({networkByte: 84, crypto: 'waves'})
  });

  test('test', async () => {
    const keyPair = {
      privateKey: "BoG1oTwBmz2NKiWazWzArx68KGxjXPkFcyPG9ogyoNyE",
      publicKey: "GffGPALxJ7tmLYbbbfKTztmMRmBj38cG45S8A3D8xV5A"
    };
    const params = {
      title: 'hello kitty',
      description: 'description',
      companyId: 'company-id',
      bulletinHash: '19079d133c4c01c363da51925db72',
      dateStart: new Date(),
      dateEnd: new Date(),
      k: 'some_string',
      participants: ['participant1', 'participant2'],
      admins: ['admin1address', 'admin2address'],
      docs: [],
      servers: [{description: 'description', pubKey: 'some_key', type: 'main_server', i: 'some_string'}]
    };
    const preparedParams = Object.keys(params).map((key): IParam => transformParam(key, params[key]));
    const dockerCreateContractMock = {
      senderPublicKey: keyPair.publicKey,
      timestamp: Date.now(),
      image: "contract",
      imageHash: "3f23d4033866831c05adf4a01495b090fe5b9ca7d0f29b720e3d62a08c118060",
      contractName: "contract",
      params: preparedParams,
      fee: '100000000',
      feeAssetId: 'EMN4GrZHZKMfHVpiaM6H9ejfjmfqrV6h6DSPHKfLCPiw'
    };
    const signatureGenerator = new TX_TYPE_MAP[TRANSACTION_TYPE.DOCKER_CREATE_V2](dockerCreateContractMock);
    const bytes = await signatureGenerator.getBytes();
    const signature = await signatureGenerator.getSignature(keyPair.privateKey);
    const isSignatureValid = crypto.isValidSignature(bytes, signature, keyPair.publicKey);
    expect(isSignatureValid).toBeTruthy()
  })
});

import {MAINNET_BYTE, TESTNET_BYTE, Seed, config, TRANSACTION_TYPE_NUMBER} from '../src/index';
import {TX_NUMBER_MAP} from '../src/signatureFactory/SignatureFactory'
import cryptoGost from '../src/utils/cryptoGost'
import crypto from '../src/utils/crypto'
import base58 from '../src/libs/base58'


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
    IDOCKERDISABLE_PROPS,
    IPOLICY_UPDATE_PROPS,
    IPOLICY_CREATE_PROPS,
    IPOLICY_REGISTER_NODE_PROPS
} from '../src/';

const MAINNET_GOST = {
    PHRASE: 'wreck author problem inch innocent surround raise code immune wink scare joke tank dragon teach',
    ADDRESS: '3FSFdLAeuKyU1LtqcjPyTZtdxpxcKqMrE2j',
    PUBLIC_KEY: '2Vx27WrzyS7Ngbq5TtSUhrv1ip8Vqr5hjoXoPfBDKGdbXQe2hhg67WHqd5spnAdxkeGjc9pPpmHn9t4zcgDoUMq8',
    PRIVATE_KEY: 'EU2Scr9cvBBVNWgcafxUt3HNBVLozpBHuZMZTLDfz5HR'
};

const TESTNET_GOST = MAINNET_GOST;

const MAINNET = {
    phrase:
        'sign clay point alpha enough supreme magic auto echo ladder reason weather twin sniff north',
    address: '3Fdc25KFhRAtY3PB3viHCkHKiz4LmAsyGpe',
    keyPair:
        {
            privateKey: '3hFkg3XwC827R7CzQLbpXQzZpMS98S3Jrv8wYY5LTtn7',
            publicKey: '3RBMLDrd27WAfv84abTZSZTE5ZBsp5JX6dNz3YteQwNz'
        }
};

const TESTNET = MAINNET;

/*
  {
        phrase:
         'stage chicken around globe typical senior buddy prepare term decrease there three clutch tackle cloud',
        address: '3FX1SurWuAqycknUBdMDR6Y8fs7Fcn1U39z',
        keyPair:
         { privateKey: '4GtBACvgnQvvEs9NP7iYb4GQ7SKfyowUkSBGdiMAZaFp',
           publicKey: 'FxgMbE4fjGtnGUY6MvhJBx9gtu3pe4U7e1kCH9JD5AN' }
   }
*/

const permissionTxMockWaves = {
    version: 1,
    type: 102,
    senderPublicKey: "3RBMLDrd27WAfv84abTZSZTE5ZBsp5JX6dNz3YteQwNz",
    timestamp: 1540202842920,
    fee: '0',
    opType: "add",
    role: "dex",
    target: "3FX1SurWuAqycknUBdMDR6Y8fs7Fcn1U39z",
    dueTimestamp: 1540212842920
};

const permissionTxMockGost = {
    version: 1,
    type: 102,
    senderPublicKey: "2Vx27WrzyS7Ngbq5TtSUhrv1ip8Vqr5hjoXoPfBDKGdbXQe2hhg67WHqd5spnAdxkeGjc9pPpmHn9t4zcgDoUMq8",
    timestamp: 1540202842920,
    fee: '0',
    opType: "add",
    role: "dex",
    target: "3FV34HcWJEq7eQEvzWdwyhsxrMr2qHBN5k6",
    dueTimestamp: 1540212842920
};

let configure: typeof TESTNET | typeof MAINNET;


/*const scriptData = {
    chainId: 84,
    "fee": '5000000',
    "timestamp": 1545992919891,
    "script": "base64:AQQAAAAHJG1hdGNoMAUAAAACdHgG+RXSzQ==",
    "name": "faucet",
    "description": "",
    version: 1,
    type: 13,
    senderPublicKey: 'F2W3jcpP1acrH62FVs97FkMPoqkvumwkXD7BepkZgwWM'
};


//TnUEn6UfLA6cH4rYYhukjFsGMyFcHaWpjgr1y6qQfzgLYBeqDmnkjN95VmktWRG6WZgWZr95FdMhgcStr8RhS3r6sUAe84QFCYC8dQuiBmZFPjY2XEuJU8JEN
//TnUEn6UfLA6cH4rYYhukjFsGMyFcHaWpjgr1y6qQfzgLYBeqDmnkjN95VmktWRG6WZgWZr95FdMhgcStr8RhS3r6sUAe84QFCYC8dQuiBmZFPjY2XEuJU8JEN

const signatureGenerator = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.SET_SCRIPT](scriptData);
signatureGenerator.getBytes().then(bytes => {
    const b = base58.encode(bytes);
    console.log(b)
});*/

const issueWithScript = {
    "type": 3,
    "id": "EMN4GrZHZKMfHVpiaM6H9ejfjmfqrV6h6DSPHKfLCPiw",
    "sender": "3N6J8YZ4VGMrcX9fHRoJutfGPmiWziMd8z7",
    "senderPublicKey": "7Qi7EuGU74GrnCuoSuEETNyGJFNnxNwLUTPurejcUWod",
    "fee": '100000000',
    "timestamp": 1549446741610,
    "version": 2,
    "assetId": "EMN4GrZHZKMfHVpiaM6H9ejfjmfqrV6h6DSPHKfLCPiw",
    "name": "test-token3",
    "quantity": '1000',
    "reissuable": false,
    precision: 5,
    "decimals": 5,
    "description": "",
    "script": "base64:AQa3b8tH",
    chainId: 'T'.charCodeAt(0)
};

describe('GOST signature tests', () => {
    [MAINNET_BYTE, TESTNET_BYTE].forEach((byte) => {
        describe(`Network byte is ${byte}`, () => {
            beforeEach(() => {
                configure = byte === MAINNET_BYTE ? MAINNET : TESTNET;
                config.set({networkByte: 84, crypto: 'gost'});
            });

            it('Permission tx object data serialization is correct', async () => {
                // todo test on zero dueTimestamp
                const signatureGenerator = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.PERMIT](permissionTxMockGost);
                const bytes = await signatureGenerator.getBytes();
                const stringAsUriComponent = encodeURIComponent(String.fromCharCode.apply(null, bytes));
                expect(stringAsUriComponent).toBe('f%01J%C3%BB.w%C2%ABi%C2%8D%C3%A8r%2C%C3%AC%C2%83%C3%84%C2%865%0F%C3%B5N%C3%9C%C2%89%0B%C2%80%C3%A3%C2%A9%C3%97%C2%8C_%C3%AE%C2%AFP%C3%88%C2%B0%5CO%C2%B7J%C2%93%C3%878%C3%AF%20%C2%8EL%C2%B9%C3%9Brz%C2%94%5D%3D%C2%AC96%C2%8C%0B%C3%8D%C2%B7%C3%81%C2%98%C3%98Z%08%C2%B6%C2%8F%01DG%C2%9B%C2%81%C3%85-%7C%C2%9C8u%C3%AA%C3%A4%02%07%20u%C2%A7%C2%89%C3%A0%0A%25%C2%B1%7C%2B%C2%BB%00%00%01f%C2%9B%3EK(%00%00%00%00%00%00%00%00a%03%00%00%01f%C2%9B%3EK(%01%00%00%01f%C2%9B%C3%96%C3%A1%C2%A8');
            });

            it('Signature is valid', async () => {
                const signatureGenerator = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.PERMIT](permissionTxMockGost);
                const bytes = await signatureGenerator.getBytes();
                const signature = await signatureGenerator.getSignature(MAINNET_GOST.PRIVATE_KEY);
                const isSignatureValid = cryptoGost.verifySignature(MAINNET_GOST.PUBLIC_KEY, signature, bytes);
                expect(isSignatureValid).toBe(true);
            });
        });
    });
});


describe('Waves signature tests', () => {
    [MAINNET_BYTE, TESTNET_BYTE].forEach((byte) => {
        describe(`Network byte is ${byte}`, () => {
            beforeEach(() => {
                configure = byte === MAINNET_BYTE ? MAINNET : TESTNET;
                config.set({networkByte: 84, crypto: 'waves'});
            });

            it('Signature is valid', async () => {
                const signatureGenerator = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.PERMIT](permissionTxMockWaves);
                const bytes = await signatureGenerator.getBytes();
                const signature = await signatureGenerator.getSignature(MAINNET.keyPair.privateKey);
                const isSignatureValid = crypto.isValidSignature(bytes, signature, MAINNET.keyPair.publicKey);
                expect(isSignatureValid).toBe(isSignatureValid);


                /* const seed = {
                     keyPair: {
                         privateKey: '3hFkg3XwC827R7CzQLbpXQzZpMS98S3Jrv8wYY5LTtn7',
                         publicKey:
                             '3RBMLDrd27WAfv84abTZSZTE5ZBsp5JX6dNz3YteQwNz'
                     }
                 };


                 // docker call
                 const dockerCallTX = {
                     "senderPublicKey": seed.keyPair.publicKey,
                     "authorPublicKey": seed.keyPair.publicKey,
                     contractId: '2D9vyC5UjBao1yGkjoofBjRPxFyXBYeSy6Y8XUafryxu',
                     "params": [],
                     "timestamp": Date.now(),
                     "fee": 500000
                 };

                 const dcMock = {
                     "senderPublicKey": "7Qi7EuGU74GrnCuoSuEETNyGJFNnxNwLUTPurejcUWod",
                     "sender": "3N6J8YZ4VGMrcX9fHRoJutfGPmiWziMd8z7",
                     "fee": "15000000",
                     "contractId": "2D9vyC5UjBao1yGkjoofBjRPxFyXBYeSy6Y8XUafryxu",
                     "id": "BpzGbk6Mvtofsde3DGVR2Lx7nEUwxWrsfHcvsaY9TZH9",
                     "type": 104,
                     "params": [
                         {
                             key: "number",
                             type: "integer",
                             value: 1
                         },
                         {
                             key: "string",
                             type: "string",
                             value: "pizda"
                         },
                         {
                             key: "binary",
                             type: "binary",
                             value: "base64:cGl6ZGVub2Noa2E="
                         },
                         {
                             key: "boolean",
                             type: "boolean",
                             value: true
                         }
                     ],
                     "version": 1,
                     "timestamp": 1554293583094
                 };

                 const dcMock2 = {
                     "senderPublicKey": "7Qi7EuGU74GrnCuoSuEETNyGJFNnxNwLUTPurejcUWod",
                     authorPublicKey: "7Qi7EuGU74GrnCuoSuEETNyGJFNnxNwLUTPurejcUWod",
                     "sender": "3N6J8YZ4VGMrcX9fHRoJutfGPmiWziMd8z7",
                     "fee": "15000000",
                     "image": "image",
                     "imageHash": "imageHash",
                     "contractName": "contractName",
                     "type": 103,
                     "version": 1,
                     "timestamp": 1554293583094,
                     params: []
                 };*/


                const dcMock2 = {
                    type: 103,
                    "senderPublicKey": "7Qi7EuGU74GrnCuoSuEETNyGJFNnxNwLUTPurejcUWod",
                    "authorPublicKey": "7Qi7EuGU74GrnCuoSuEETNyGJFNnxNwLUTPurejcUWod",
                    "timestamp": 1554887021294,
                    "image": "tdm-actions-execution:latest",
                    "imageHash": "sha256:a77b9aede9c28ca7bf00bf84cc753c039c27269c6cda6511066739086a156453",
                    "contractName": "contract_test",
                    "params": [{"key": "key1", "type": "string", "value": "dsfarfarfar"}, {
                        "key": "key2",
                        "type": "integer",
                        "value": "222"
                    }, {"key": "key3", "type": "boolean", "value": true},
                        {"key": "key", "type": "binary", "value": "base64:abcd"}],
                    "fee": "100000000"
                };


                /* const signatureGenerator2 = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.DOCKER_CREATE](dcMock2);
                 // const bytes2 = await signatureGenerator2.getBytes();
                 // const signature2 = await signatureGenerator2.getSignature(seed.keyPair.privateKey);
                 // console.log('signature2', bytes2);

                 signatureGenerator2.getBytes().then(bytes => {
                     //    const b = base58.encode(bytes);
                     console.log(Array.from(bytes).map(e => e > 127 ? ((256 - e) * -1) : e).join(','))
                 })*/
                // /docker call

                /*const reg = {
                    type: 111,
                    "senderPublicKey": "7Qi7EuGU74GrnCuoSuEETNyGJFNnxNwLUTPurejcUWod",
                    "target": "7Qi7EuGU74GrnCuoSuEETNyGJFNnxNwLUTPurejcUWod",
                    "timestamp": 1554887021294,
                    "nodeName": "shit",
                    "opType": "add",
                };

                 const s = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.POLICY_REGISTER_NODE](reg);
                 const b = await s.getBytes();
                 console.log(b);
                 console.log(base58.encode(b));

                 s.getBytes().then(bytes => {

                     const b = base58.encode(bytes);
                     console.log(Array.from(bytes).map(e => e > 127 ? ((256 - e) * -1) : e).join(', '))
                 });*/

                /*const reg3 = {
                    "senderPublicKey": "faf2Rwo9WUoiVchf7dSahT33pS7TZLETRWrRw39Asti",
                    "sender": "3N8WVBp1QTGsU1qKfgdptpj55CRJk5qLuW4",
                    "policyName": "Oscar policy",
                    "proofs": ["2WXHAQp9eR8BcwgDCAwMC5uSHALqABVPsRMayjnn6SYErxiPp1SBotpEfNEzxFKebn7bQCJkRZEAJ1gedm1sPUhmGBB"],
                    "recipients": ["3N6J8YZ4VGMrcX9fHRoJutfGPmiWziMd8z7"],
                    "fee": 100000000,
                    "description": "Policy description!",
                    "owners": ["3N6J8YZ4VGMrcX9fHRoJutfGPmiWziMd8z7"],
                    "id": "25BTLqYhHcySzdv7skLmzqc2JnssjVQQiXeuDbQ233EJ",
                    "type": 112,
                    "timestamp": 1560433576046
                };

                const s = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.POLICY_CREATE](reg3);
                const b = await s.getBytes();
                console.log(b);

                s.getBytes().then(bytes => {

                    const b = base58.encode(bytes);
                    console.log(Array.from(bytes).map(e => e > 127 ? ((256 - e) * -1) : e).join(', '))
                });

                toBytes('policyName', new StringWithLength('policyName').process('Oscar policy'));
                toBytes('description', new StringWithLength('description').process('Policy description!'));

                toBytes('owners', new ArrayOfStringsWithLength('owners').process(['3N6J8YZ4VGMrcX9fHRoJutfGPmiWziMd8z7']));
                toBytes('recipients', new ArrayOfStringsWithLength('recipients').process(['3N6J8YZ4VGMrcX9fHRoJutfGPmiWziMd8z7']));

                async function toBytes(title, promise) {
                    const bytes = await promise;
                    const arr: number[] = Array.from(bytes);
                    const result = arr.map(e => e > 127 ? ((256 - e) * -1) : e).join(', ')
                }*/
            });
        });
    });
});

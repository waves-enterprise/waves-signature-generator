import {MAINNET_BYTE, TESTNET_BYTE, Seed, config, TRANSACTION_TYPE_NUMBER} from '../src/index';
import {TX_NUMBER_MAP} from '../src/signatureFactory/SignatureFactory'
import cryptoGost from '../src/utils/cryptoGost'
import crypto from '../src/utils/crypto'
import base58 from '../src/libs/base58'

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


describe('GOST signature tests', () => {
    [MAINNET_BYTE, TESTNET_BYTE].forEach((byte) => {
        describe(`Network byte is ${byte}`, () => {
            beforeEach(() => {
                configure = byte === MAINNET_BYTE ? MAINNET : TESTNET;
                config.set({networkByte: byte, crypto: 'gost'});
            });

            it('Permission tx object data serialization is correct', async () => {
                // todo test on zero dueTimestamp
                const signatureGenerator = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.PERMIT](permissionTxMockGost);
                const bytes = await signatureGenerator.getBytes();
                const b64 = btoa(String.fromCharCode.apply(null, bytes));
                expect(b64).toBe('ZgFK+y53q2mN6HIs7IPEhjUP9U7ciQuA46nXjF/ur1DIsFxPt0qTxzjvII5MudtyepRdPaw5NowLzbfBmNhaCLaPAURHm4HFLXycOHXq5AIHIHWnieAKJbF8K7sAAAFmmz5LKGEDAAABZps+SygBAAABZpvW4ag=');
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
                config.set({networkByte: byte, crypto: 'waves'});
            });

            it('Signature is valid', async () => {
                const signatureGenerator = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.PERMIT](permissionTxMockWaves);
                const bytes = await signatureGenerator.getBytes();
                const signature = await signatureGenerator.getSignature(MAINNET.keyPair.privateKey);
                const isSignatureValid = crypto.isValidSignature(bytes, signature, MAINNET.keyPair.publicKey);
                expect(isSignatureValid).toBe(isSignatureValid);
            });
        });
    });
});
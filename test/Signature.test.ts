import {MAINNET_BYTE, TESTNET_BYTE, Seed, config, TRANSACTION_TYPE_NUMBER} from '../src/index';
import {TX_NUMBER_MAP} from '../src/signatureFactory/SignatureFactory'
import cryptoGost from '../src/utils/cryptoGost'

const MAINNET = {
    PHRASE: 'wreck author problem inch innocent surround raise code immune wink scare joke tank dragon teach',
    ADDRESS: '3FSFdLAeuKyU1LtqcjPyTZtdxpxcKqMrE2j',
    PUBLIC_KEY: '2Vx27WrzyS7Ngbq5TtSUhrv1ip8Vqr5hjoXoPfBDKGdbXQe2hhg67WHqd5spnAdxkeGjc9pPpmHn9t4zcgDoUMq8',
    PRIVATE_KEY: 'EU2Scr9cvBBVNWgcafxUt3HNBVLozpBHuZMZTLDfz5HR'
};

const TESTNET = {
    PHRASE: 'wreck author problem inch innocent surround raise code immune wink scare joke tank dragon teach',
    ADDRESS: '3FSFdLAeuKyU1LtqcjPyTZtdxpxcKqMrE2j',
    PUBLIC_KEY: '2Vx27WrzyS7Ngbq5TtSUhrv1ip8Vqr5hjoXoPfBDKGdbXQe2hhg67WHqd5spnAdxkeGjc9pPpmHn9t4zcgDoUMq8',
    PRIVATE_KEY: 'EU2Scr9cvBBVNWgcafxUt3HNBVLozpBHuZMZTLDfz5HR'
};

const permissionTxMock = {
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

describe('Signature tests', () => {
    [MAINNET_BYTE, TESTNET_BYTE].forEach((byte) => {
        describe(`Network byte is ${byte}`, () => {
            beforeEach(() => {
                configure = byte === MAINNET_BYTE ? MAINNET : TESTNET;
                config.set({networkByte: byte});
            });

            it('Permission tx object data serialization is correct', async () => {
                // todo test on zero dueTimestamp
                const signatureGenerator = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.PERMIT](permissionTxMock);
                const bytes = await signatureGenerator.getBytes();
                const b64 = btoa(String.fromCharCode.apply(null, bytes));
                expect(b64).toBe('ZgFK+y53q2mN6HIs7IPEhjUP9U7ciQuA46nXjF/ur1DIsFxPt0qTxzjvII5MudtyepRdPaw5NowLzbfBmNhaCLaPAURHm4HFLXycOHXq5AIHIHWnieAKJbF8K7sAAAFmmz5LKGEDAAABZps+SygBAAABZpvW4ag=');
            });

            it('Signature is valid', async () => {
                const signatureGenerator = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.PERMIT](permissionTxMock);
                const bytes = await signatureGenerator.getBytes();
                const signature = await signatureGenerator.getSignature(MAINNET.PRIVATE_KEY);
                const isSignatureValid = cryptoGost.verifySignature(MAINNET.PUBLIC_KEY, signature, bytes);
                expect(isSignatureValid).toBe(true);
            });
        });
    });
});

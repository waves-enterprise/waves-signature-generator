import {MAINNET_BYTE, TESTNET_BYTE, Seed, config} from '../src/index';

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

let configure: typeof TESTNET | typeof MAINNET;

describe('Seed tests', () => {
    [MAINNET_BYTE, TESTNET_BYTE].forEach((byte) => {

        describe(`Network byte is ${byte}`, () => {

            beforeEach(() => {
                configure = byte === MAINNET_BYTE ? MAINNET : TESTNET;
                config.set({networkByte: byte});
            });

            it('get address from phrase', () => {
                const seed = Seed.fromExistingPhrase(configure.PHRASE);
                expect(seed.address).toBe(configure.ADDRESS);
            });

            it('get public key from phrase', () => {
                const seed = Seed.fromExistingPhrase(configure.PHRASE);
                expect(seed.keyPair.publicKey).toBe(configure.PUBLIC_KEY);
            });

            it('get private key from phrase', () => {
                const seed = Seed.fromExistingPhrase(configure.PHRASE);
                expect(seed.keyPair.privateKey).toBe(configure.PRIVATE_KEY);
            });
        });

    });
});

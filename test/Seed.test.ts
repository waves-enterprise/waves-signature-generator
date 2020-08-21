import {MAINNET_BYTE, TESTNET_BYTE, Seed, config} from '../src';
// import {TX_NUMBER_MAP} from '../src/signatureFactory/SignatureFactory'

const MAINNET = {
    PHRASE: 'boil hip drill joke ability ghost match dizzy opera interest damage cute critic happy eye',
    ADDRESS: '3P6YQqoCrvVWhHm8Gz5hEZs9reb1jvq8SFQ',
    PUBLIC_KEY: 'ChziWp2CBVfoYN1CdYzoSvQL4xMNB7mjKaXgMFrVJoPW',
    PRIVATE_KEY: '6wa1xTfbg6KeGfj3mRPAVMeTYMVghFqBvpnAwWfiQHSu'
};

const TESTNET = {
    PHRASE: 'boil hip drill joke ability ghost match dizzy opera interest damage cute critic happy eye',
    ADDRESS: '3MtXbtUJznx84qTi1uphH7VLVm5EumdpTdS',
    PUBLIC_KEY: 'ChziWp2CBVfoYN1CdYzoSvQL4xMNB7mjKaXgMFrVJoPW',
    PRIVATE_KEY: '6wa1xTfbg6KeGfj3mRPAVMeTYMVghFqBvpnAwWfiQHSu'
};


const MAINNET_GOST = {
    PHRASE: 'wreck author problem inch innocent surround raise code immune wink scare joke tank dragon teach',
    ADDRESS: '3FSFdLAeuKyU1LtqcjPyTZtdxpxcKqMrE2j',
    PUBLIC_KEY: '2Vx27WrzyS7Ngbq5TtSUhrv1ip8Vqr5hjoXoPfBDKGdbXQe2hhg67WHqd5spnAdxkeGjc9pPpmHn9t4zcgDoUMq8',
    PRIVATE_KEY: 'EU2Scr9cvBBVNWgcafxUt3HNBVLozpBHuZMZTLDfz5HR'
};

const TESTNET_GOST = {
    PHRASE: 'wreck author problem inch innocent surround raise code immune wink scare joke tank dragon teach',
    ADDRESS: '3FSFdLAeuKyU1LtqcjPyTZtdxpxcKqMrE2j',
    PUBLIC_KEY: '2Vx27WrzyS7Ngbq5TtSUhrv1ip8Vqr5hjoXoPfBDKGdbXQe2hhg67WHqd5spnAdxkeGjc9pPpmHn9t4zcgDoUMq8',
    PRIVATE_KEY: 'EU2Scr9cvBBVNWgcafxUt3HNBVLozpBHuZMZTLDfz5HR'
};

let configure: typeof TESTNET_GOST | typeof MAINNET_GOST;

describe('GOST crypto Seed tests', () => {
    [MAINNET_BYTE, TESTNET_BYTE].forEach((byte) => {

        describe(`Network byte is ${byte}`, () => {

            beforeEach(() => {
                configure = byte === MAINNET_BYTE ? MAINNET_GOST : TESTNET_GOST;
                config.set({networkByte: byte, crypto: 'gost'});
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

// todo формализировать и вынести в константы байты сети
describe('WAVES crypto Seed tests', () => {
    ['W'.charCodeAt(0), 'T'.charCodeAt(0)].forEach((byte) => {

        describe(`Network byte is ${byte}`, () => {

            beforeEach(() => {
                configure = byte === 'W'.charCodeAt(0) ? MAINNET : TESTNET;
                config.set({networkByte: byte, crypto: 'waves'});
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

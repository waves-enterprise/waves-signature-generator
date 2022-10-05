"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
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
let configure;
describe('WAVES crypto Seed tests', () => {
    ['W'.charCodeAt(0), 'T'.charCodeAt(0)].forEach((byte) => {
        describe(`Network byte is ${byte}`, () => {
            beforeEach(() => {
                configure = byte === 'W'.charCodeAt(0) ? MAINNET : TESTNET;
                src_1.config.set({ networkByte: byte, crypto: 'waves' });
            });
            it('get address from phrase', () => {
                const seed = src_1.Seed.fromExistingPhrase(configure.PHRASE);
                expect(seed.address).toBe(configure.ADDRESS);
            });
            it('get public key from phrase', () => {
                const seed = src_1.Seed.fromExistingPhrase(configure.PHRASE);
                expect(seed.keyPair.publicKey).toBe(configure.PUBLIC_KEY);
            });
            it('get private key from phrase', () => {
                const seed = src_1.Seed.fromExistingPhrase(configure.PHRASE);
                expect(seed.keyPair.privateKey).toBe(configure.PRIVATE_KEY);
            });
        });
    });
});

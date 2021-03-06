import {IKeyPair} from './interface';
import {config} from './config/Config';
import {libs, utils} from './index';
import dictionary from './dictionary';


export class Seed {

    public readonly phrase: string;
    public readonly address: string;
    public readonly keyPair: IKeyPair;
    public readonly isGost: boolean;

    constructor(phrase: string) {
        if (phrase.length < config.get('minimalSeedLength')) {
            throw new Error('Your seed length is less than allowed in config');
        }

        const keys = config.isCryptoGost() ? utils.cryptoGost.buildKeyPair(phrase) : utils.crypto.buildKeyPair(phrase);

        this.phrase = phrase;
        this.address = config.isCryptoGost() ? utils.cryptoGost.buildRawAddress(keys.publicKey) : utils.crypto.buildRawAddress(keys.publicKey);

        this.keyPair = {
            privateKey: libs.base58.encode(keys.privateKey),
            publicKey: libs.base58.encode(keys.publicKey)
        };

        Object.freeze(this);
        Object.freeze(this.keyPair);
    }

    public encrypt(password: string, encryptionRounds?: number) {
        return Seed.encryptSeedPhrase(this.phrase, password, this.address, this.isGost);
    }

    public static encryptSeedPhrase(seedPhrase: string, password: string, address: string, isGost: boolean = false): string {
        if (password && password.length < 8) {
            // logger.warn('Your password may be too weak');
        }

        if (seedPhrase.length < config.get('minimalSeedLength')) {
            throw new Error('The seed phrase you are trying to encrypt is too short');
        }

        // return isGost ? utils.cryptoGost.encryptSeed(seedPhrase, password, address) : utils.crypto.encryptSeed(seedPhrase, password);
        return utils.crypto.encryptSeed(seedPhrase, password);
    }

    public static decryptSeedPhrase(encryptedSeedPhrase: string, password: string, address: string): string {

        const wrongPasswordMessage = 'The password is wrong';

        let phrase;

        try {
            // phrase = config.isCryptoGost() ? utils.cryptoGost.decryptSeed(encryptedSeedPhrase, password, address) : utils.crypto.decryptSeed(encryptedSeedPhrase, password);
            phrase = utils.crypto.decryptSeed(encryptedSeedPhrase, password);
        } catch (e) {
            throw new Error(wrongPasswordMessage);
        }

        if (phrase === '' || phrase.length < config.get('minimalSeedLength')) {
            throw new Error(wrongPasswordMessage);
        }

        return phrase;

    }

    public static create(words: number = 15): Seed {
        const phrase = Seed._generateNewSeed(words);
        const minimumSeedLength = config.get('minimalSeedLength');

        if (phrase.length < minimumSeedLength) {
            // If you see that error you should increase the number of words in the generated seed
            throw new Error(`The resulted seed length is less than the minimum length (${minimumSeedLength})`);
        }

        return new Seed(phrase);
    }

    public static fromExistingPhrase(phrase: string): Seed {
        const minimumSeedLength = config.get('minimalSeedLength');

        if (phrase.length < minimumSeedLength) {
            // If you see that error you should increase the number of words or set it lower in the config
            throw new Error(`The resulted seed length is less than the minimum length (${minimumSeedLength})`);
        }

        return new Seed(phrase);
    }

    private static _generateNewSeed(length: number): string {

        const random = config.isCryptoGost() ? utils.cryptoGost.generateRandomUint32Array(length) : utils.crypto.generateRandomUint32Array(length);
        const wordCount = dictionary.length;
        const phrase = [];

        for (let i = 0; i < length; i++) {
            const wordIndex = random[i] % wordCount;
            phrase.push(dictionary[wordIndex]);
        }

        random.set(new Uint8Array(random.length));

        return phrase.join(' ');

    }

}

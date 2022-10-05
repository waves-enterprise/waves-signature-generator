"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto-browserify");
const axlsign_1 = require("../src/libs/axlsign");
const encryptor_1 = require("../src/libs/encryptor");
const converters_1 = require("../src/libs/converters");
describe('Message encryption', () => {
    const value = 'test test test';
    it('encrypt and decrypt AES-GCM', () => {
        const symmetricKey = crypto.randomBytes(16);
        const res = encryptor_1.default.encryptAes(symmetricKey, value);
        const decrypted = encryptor_1.default.decryptAes(symmetricKey, res);
        expect(converters_1.default.byteArrayToString(decrypted)).toBe(value);
    });
    it('encrypt and decrypt Diffie-Hellman', () => {
        const sender = axlsign_1.default.generateKeyPair(Uint8Array.from(crypto.randomBytes(32)));
        const recipient = axlsign_1.default.generateKeyPair(Uint8Array.from(crypto.randomBytes(32)));
        const { encryptedData, encryptedKey } = encryptor_1.default.encrypt(value, sender.private, recipient.public);
        const result = encryptor_1.default.decrypt(encryptedData, encryptedKey, recipient.private, sender.public);
        expect(converters_1.default.byteArrayToString(result)).toBe(value);
    });
    it('encrypt and decrypt for many', () => {
        const sender = axlsign_1.default.generateKeyPair(Uint8Array.from(crypto.randomBytes(32)));
        const recipients = [0, 0, 0, 0].map(() => axlsign_1.default.generateKeyPair(Uint8Array.from(crypto.randomBytes(32))));
        const { encryptedData, recipientEncryptedKeys } = encryptor_1.default.encryptForMany(value, sender.private, recipients.map(val => val.public));
        recipientEncryptedKeys.forEach((encryptedKey, i) => {
            const result = encryptor_1.default.decrypt(encryptedData, encryptedKey, recipients[i].private, sender.public);
            expect(converters_1.default.byteArrayToString(result)).toBe(value);
        });
    });
});

import * as crypto from 'crypto-browserify';
import axlsign from '../src/libs/axlsign';
import Encryptor from '../src/libs/encryptor';
import converter from '../src/libs/converters';


describe('Message encryption', () => {
  const value = 'test test test';

  it('encrypt and decrypt AES-GCM', () => {
    const symmetricKey = crypto.randomBytes(16);
    const res = Encryptor.encryptAes(symmetricKey, value);
    const decrypted = Encryptor.decryptAes(symmetricKey, res)
    expect(converter.byteArrayToString(decrypted)).toBe(value);
  });

  it('encrypt and decrypt Diffie-Hellman', () => {
    const sender = axlsign.generateKeyPair(Uint8Array.from(crypto.randomBytes(32)))
    const recipient = axlsign.generateKeyPair(Uint8Array.from(crypto.randomBytes(32)))

    const {
      encryptedData,
      encryptedKey
    } = Encryptor.encrypt(value, sender.private, recipient.public)

    const result = Encryptor.decrypt(
      encryptedData,
      encryptedKey,
      recipient.private,
      sender.public
    )

    expect(converter.byteArrayToString(result)).toBe(value);
  });

  it('encrypt and decrypt for many', () => {
    const sender = axlsign.generateKeyPair(Uint8Array.from(crypto.randomBytes(32)))
    const recipients = [0, 0, 0, 0].map(() =>
      axlsign.generateKeyPair(Uint8Array.from(crypto.randomBytes(32))))

    const {
      encryptedData,
      recipientEncryptedKeys
    } = Encryptor.encryptForMany(value, sender.private, recipients.map(val => val.public))


    recipientEncryptedKeys.forEach((encryptedKey, i) => {
      const result = Encryptor.decrypt(
        encryptedData,
        encryptedKey,
        recipients[i].private,
        sender.public
      )
      expect(converter.byteArrayToString(result)).toBe(value);
    })
  });
});

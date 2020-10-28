import * as crypto from 'crypto-browserify';
import axlsign from './axlsign'
import { concat } from '../utils/concat';
import converter from './converters';

const ivLength = 16
const keySize  = 16
const authTagLength = 16
const ALGO = 'AES-128-GCM';


/*
  Encryption/Decryption is done via AES using Diffie-Hellman
  common secret. A generated random symmetric key is used for
  encryption, then it is encrypted on Diffie-Hellman secret of
  two participants.
 */

export default class Encryptor {

  static encryptAes(key: string | Uint8Array, str: string | Uint8Array): Uint8Array {
    key = crypto.createHash('md5').update(key).digest();
    if (typeof str === 'string') {
      str = Uint8Array.from(converter.stringToByteArray(str))
    }
    const iv = Uint8Array.from(crypto.randomBytes(ivLength));
    const cipher = crypto.createCipheriv(ALGO, key, iv, {authTagLength})
    cipher.setAutoPadding(false);
    let encrypted = cipher.update(str);
    encrypted = concat([encrypted, cipher.final()])
    return concat([
      iv,
      encrypted,
      cipher.getAuthTag()
    ])
  }

  static decryptAes(key: string | Uint8Array, val: Uint8Array | string): Uint8Array {
    if (typeof val === 'string') {
      val = Uint8Array.from(converter.stringToByteArray(val))
    }
    const keyBuf = crypto.createHash('md5').update(key).digest();
    const authTag = val.slice(-authTagLength)
    const iv = val.slice(0, ivLength)
    const valBuf = val.slice(ivLength, -authTagLength)
    const decipher = crypto.createDecipheriv(ALGO, keyBuf, iv);
    decipher.setAuthTag(authTag);
    return concat([
      decipher.update(valBuf),
      decipher.final()
    ])
  }

  static encrypt(data: string | Uint8Array, senderPrivateKey: Uint8Array, recipientPublicKey: Uint8Array) {
    const symmetricKey = Uint8Array.from(crypto.randomBytes(keySize));
    const secret = axlsign.sharedKey(senderPrivateKey, recipientPublicKey)

    const encryptedData = this.encryptAes(symmetricKey, data)
    const encryptedKey = this.encryptAes(secret, symmetricKey)

    return {
      encryptedData,
      encryptedKey
    }
  }

  static decrypt(data: string | Uint8Array,
                 wrappedKey: string | Uint8Array,
                 recipientPrivateKey: Uint8Array,
                 senderPublicKey: Uint8Array) {
    const secret = axlsign.sharedKey(recipientPrivateKey, senderPublicKey)
    const symmetricKey = this.decryptAes(secret, wrappedKey)
    return this.decryptAes(symmetricKey, data)
  }

  static encryptForMany(data: string | Uint8Array,
                        senderPrivateKey: Uint8Array,
                        recipientPublicKeys: Uint8Array[]) {
    const symmetricKey = crypto.randomBytes(keySize);
    const encryptedData = this.encryptAes(symmetricKey, data)
    const recipientEncryptedKeys = recipientPublicKeys.map(key => {
      const secret = axlsign.sharedKey(senderPrivateKey, key)
      return this.encryptAes(secret, symmetricKey)
    })
    return { encryptedData, recipientEncryptedKeys }
  }
}
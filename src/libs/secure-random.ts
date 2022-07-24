import randomBytes from '@consento/sync-randombytes'

declare const Buffer: any;

function secureRandom(count, options) {
    const randomUint8Array = randomBytes(new Uint8Array(count))

    switch (options.type) {
        case 'Buffer':
            try {
                const b = new Buffer(1);
            } catch (e) {
                throw new Error('Buffer not supported in this environment. Use Node.js or Browserify for browser support.');
            }
            return new Buffer(randomUint8Array);
        case 'Uint8Array':
            return randomUint8Array;
        default:
            return [].slice.call(randomUint8Array);
    }
}

export default {

    secureRandom: secureRandom,

    randomArray(byteCount) {
        return secureRandom(byteCount, {type: 'Array'});
    },

    randomUint8Array(byteCount) {
        return secureRandom(byteCount, {type: 'Uint8Array'});
    },

    randomBuffer(byteCount) {
        return secureRandom(byteCount, {type: 'Buffer'});
    }

};

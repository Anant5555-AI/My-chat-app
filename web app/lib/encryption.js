import CryptoJS from 'crypto-js';

// Matches mobile_new/src/services/EncryptionService.js logic for compatibility
export class EncryptionService {
    /**
     * Generate a random symmetric key (hex string)
     */
    static generateSymmetricKey() {
        return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
    }

    /**
     * Generate a key pair
     * Note: Matches mobile implementation of simulated key pair
     */
    static generateKeyPair() {
        return {
            publicKey: CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex),
            privateKey: CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex),
        };
    }

    /**
     * Derive a shared secret
     * Logic: SHA256(privateKey + otherPublicKey)
     */
    static computeSharedSecret(privateKeyHex, otherPublicKeyHex) {
        if (!privateKeyHex || !otherPublicKeyHex) return null;
        const combined = privateKeyHex + otherPublicKeyHex;
        return CryptoJS.SHA256(combined).toString(CryptoJS.enc.Hex);
    }

    /**
     * Encrypt a message
     */
    static encrypt(message, sharedSecret) {
        const iv = CryptoJS.lib.WordArray.random(16);
        const key = CryptoJS.SHA256(sharedSecret); // Ensure 32-byte key

        const encrypted = CryptoJS.AES.encrypt(message, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return {
            encrypted: encrypted.ciphertext.toString(CryptoJS.enc.Hex),
            iv: iv.toString(CryptoJS.enc.Hex),
            authTag: '0000000000000000' // Fake auth tag as CBC doesn't have it
        };
    }

    /**
     * Decrypt a message
     */
    static decrypt(encryptedHex, ivHex, authTagHex, sharedSecret) {
        try {
            const key = CryptoJS.SHA256(sharedSecret);
            const iv = CryptoJS.enc.Hex.parse(ivHex);
            const ciphertext = CryptoJS.enc.Hex.parse(encryptedHex);

            const cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: ciphertext
            });

            const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            console.error("Decryption failed", e);
            return "[Decryption Error]";
        }
    }
}

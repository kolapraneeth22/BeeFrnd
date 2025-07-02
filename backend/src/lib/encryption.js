import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY || 'your-super-secret-message-key-change-this-in-production';

export const encryptMessage = (message) => {
    if (!message || message.trim() === '') return message;
    
    try {
        const encrypted = CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error('Error encrypting message:', error);
        return message; // Return original message if encryption fails
    }
};

export const decryptMessage = (encryptedMessage) => {
    if (!encryptedMessage || encryptedMessage.trim() === '') return encryptedMessage;
    
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
        const originalMessage = decrypted.toString(CryptoJS.enc.Utf8);
        return originalMessage || encryptedMessage; // Return encrypted if decryption fails
    } catch (error) {
        console.error('Error decrypting message:', error);
        return encryptedMessage; // Return encrypted message if decryption fails
    }
};
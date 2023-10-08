/**
 * 
 * @returns {CryptoKey} Symmetric Key
 */
export async function generateRSA(){
    return await window.crypto.subtle.generateKey({
        name: "RSA-OAEP",
        modulusLength: 2048, //can be 1024, 2048, or 4096
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    },
    true, //whether the key is extractable (i.e. can be used in exportKey)
    ["encrypt", "decrypt"]);
}

/**
 * 
 * @returns {CryptoKey} Symmetric Key
 */
export async function generateRSASign(){
    return await window.crypto.subtle.generateKey(
        {
            name: "RSA-PSS",
            modulusLength: 2048, //can be 1024, 2048, or 4096
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
        true, //whether the key is extractable (i.e. can be used in exportKey)
        ["sign", "verify"]
    )
}

/**
 * 
 * @param {CryptoKey} key 
 * @returns {object} key in jwk format
 */
export async function exportKey(key){
    return await window.crypto.subtle.exportKey("jwk", key);
}

/**
 * 
 * @returns {CryptoKey} Symmetric Key
 */
export async function generateAESKey(){
    return await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
}

/**
 * 
 * @param {string} key Stringified key in jwk format
 * @returns {CryptoKey}
 */
export async function importPublicKeySign(key){
    const jsonKey = JSON.parse(key)
    return await window.crypto.subtle.importKey(
        "jwk",
        jsonKey,
        {
            name: "RSA-PSS",
            hash:{name:"SHA-256"},
        },
        true,
        ["verify"]
    );
}

/**
 * 
 * @param {string} key Stringified key in jwk format
 * @returns {CryptoKey}
 */
export async function importPrivateKeySign(key){
    const jsonKey = JSON.parse(key)
    return await window.crypto.subtle.importKey(

        "jwk",
        jsonKey,
        {
            name: "RSA-PSS",
            hash:{name:"SHA-256"},
        },
        true,
        ["sign"]
    );
}

/**
 * 
 * @param {string} key Stringified key in jwk format
 * @returns {CryptoKey}
 */
export async function importPublicKey(key){
    const jsonKey = JSON.parse(key)
    return await window.crypto.subtle.importKey(
        "jwk",
        jsonKey,
        {
            name: "RSA-OAEP",
            hash:{name:"SHA-256"},
        },
        true,
        ["encrypt"]
    );
}

/**
 * 
 * @param {string} key Stringified key in jwk format
 * @returns {CryptoKey}
 */
export async function importPrivateKey(key){
    const jsonKey = JSON.parse(key)
    return await window.crypto.subtle.importKey(

        "jwk",
        jsonKey,
        {
            name: "RSA-OAEP",
            hash:{name:"SHA-256"},
        },
        true,
        ["decrypt"]
    );
}

/**
 * 
 * @param {string} key Stringified key in jwk format
 * @returns {CryptoKey}
 */
 export async function importAESKey(key){
    const jsonKey = JSON.parse(key)
    return await window.crypto.subtle.importKey(
        "jwk",
        jsonKey,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]
    );
}

/**
 * 
 * @param {CryptoKey} publicKey 
 * @param {string} msg 
 * @returns {String}
 */
export async function encryptRSAMsg(publicKey, msg){
    let enc = new TextEncoder();
    let encoded = enc.encode(msg)
    let arrayBuffer = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        publicKey,
        encoded
    );
    return arrayBufferToString(arrayBuffer);
}

/**
 * 
 * @param {CryptoKey} key 
 * @param {string} msg 
 * @returns {ArrayBuffer}
 */
 export async function encryptAESMsg(key, msg){
    let enc = new TextEncoder();
    let encoded = enc.encode(msg);
    let iv = window.crypto.getRandomValues(new Uint8Array(12));
    return await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv
        },
        key,
        encoded
    );
}

export class EncryptedMessage {
    /**
     * @param {string} message JSON stringified object with form "{ message: "", iv: ""}"
     */
    constructor(message){
        let obj = JSON.parse(message);
        this.message = obj.message;
        this.iv = obj.iv;
    }

    /**
     * @param {CryptoKey} key 
     * @returns {String} decrypted message
     */
    async decrypt(key){
        if(key.usages.indexOf('decrypt') < 0)
            throw new Error('Key not valid for message type');
        let algorithm = key.algorithm.name;
        let decoder = new TextDecoder("utf-8");
        if(algorithm === "AES-GCM"){
            let decrypted = await window.crypto.subtle.decrypt({
                name: algorithm,
                iv: stringToArrayBuffer(this.iv)
            }, key, stringToArrayBuffer(this.message));
            return decoder.decode(decrypted);
        }
        else{
            let decrypted = await window.crypto.subtle.decrypt({
                name: algorithm
            }, key, stringToArrayBuffer(this.message));
            return decoder.decode(decrypted);
        }
    }

    toString(){
        return JSON.stringify({message: this.message, iv: this.iv});
    }
}

export class PlaintextMessage {
    /**
     * @param {string} message 
     */
    constructor(message){
        this.message = message;
    }

    /**
     * @param {CryptoKey} key
     * @returns {string} Stringified JSON in format {"message":"", "iv":""}
     */
    async encrypt(key){
        if(key.usages.indexOf('encrypt') < 0)
            throw new Error('Key not valid for message type');
        let algorithm = key.algorithm.name;
        const encoder = new TextEncoder();
        const encodedMsg = encoder.encode(this.message);
        if(algorithm === "AES-GCM"){
            let iv = window.crypto.getRandomValues(new Uint8Array(12));
            let encMessage = await window.crypto.subtle.encrypt({
                name: algorithm,
                iv
            }, key, encodedMsg);
            return JSON.stringify({message: arrayBufferToString(encMessage), iv: arrayBufferToString(iv)});
        }
        else{
            let encMessage = await window.crypto.subtle.encrypt({
                name: algorithm
            }, key, encodedMsg);
            return JSON.stringify({message: arrayBufferToString(encMessage)});
        }
    }

    toString(){
        return this.message;
    }
}

/**
 * 
 * @param {ArrayBuffer} buffer 
 * @returns {String} 
 */
function arrayBufferToString( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    for (var i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    var base64 = window.btoa( binary );
    // convert unicode string to string where each 16-bit unit occupies one byte
    const codeUnits = new Uint16Array(base64.length);
    for (let i = 0; i < codeUnits.length; i++) {
        codeUnits[i] = base64.charCodeAt(i);
    }
    return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
}

/**
 * 
 * @param {String} string 
 * @returns {ArrayBuffer}
 */
function stringToArrayBuffer(string) {

    const binary = atob(string);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    var base64 = String.fromCharCode(...new Uint16Array(bytes.buffer));

    var binStr =  window.atob(base64);
    var bytes2 = new Uint8Array(binStr.length);
    for (var i = 0; i < binStr.length; i++)        {
        bytes2[i] = binStr.charCodeAt(i);
    }
    return bytes2.buffer;
}
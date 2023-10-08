export function arrayBufferToString( buffer ) {
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


export function stringToArrayBuffer(string) {

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

export function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export async function decryptMessage(privateKey, ciphertext) {
    let decrypted = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP"
        },
        privateKey,
        ciphertext
    );

    let decoder = new TextDecoder("utf-8");
    let plainText = decoder.decode(decrypted);
    return plainText;
}

export async function sign(privateKey, digest) {
    return await window.crypto.subtle.sign(
        {
            name: "RSA-PSS",
            saltLength: 32,
        },
        privateKey,
        digest
    )
}

export async function digestMessage(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    return await crypto.subtle.digest('SHA-256', data);
}

export async function verifyDigest(publicKey, signature, digest) {
    return await window.crypto.subtle.verify(
            {
                name: "RSA-PSS",
                saltLength: 32,
            },
            publicKey,
            signature,
            digest
        )
}

export async function post(url, body){
    let res = await fetch(url, {
        method: 'POST',
        body
    });
    console.log(res)
    return await res.json();
}

export async function get(url){
    let res = await fetch(url);
    return await res.json();
}

export function timestampToTimeString(time) {
    let dateTime = new Date(time);
    return dateTime.toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'});
}
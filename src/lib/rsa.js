'use client';

const getJSEncrypt = async () => {
    let JSEncrypt = (await import("@/lib/jsencrypt.min")).default
    // console.log("JSEncrypt loaded: ", JSEncrypt)

    return new JSEncrypt({default_key_size: 2048});
}

function pemEncode(label, data) {
    const base64encoded = window.btoa(data);
    const base64encodedWrapped = base64encoded.replace(/(.{64})/g, "$1\n");
    return `-----BEGIN ${label}-----\n${base64encodedWrapped}\n-----END ${label}-----`;
}

function arrayBufToString(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

async function exportKeyAsString(format, key) {
    const exported = await window.crypto.subtle.exportKey(format, key);
    return arrayBufToString(exported);
}

const genKey2 = async (keySize) => {
    if (keySize === undefined)
        keySize = 4096;

    if (!window || !window.crypto || !window.crypto.subtle) {
        alert("Your browser does not support the Web Cryptography API! This page will not work.");
        return undefined;
    }

    let kp = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: keySize,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"],
    );

    let res = await exportKeyAsString("spki", kp.publicKey);
    let res2 = await exportKeyAsString("pkcs8", kp.privateKey);

    res = pemEncode("PUBLIC KEY", res);
    res2 = pemEncode("PRIVATE KEY", res2);

    const encrypt = await getJSEncrypt({default_key_size: keySize});

    encrypt.setPublicKey(res);
    encrypt.setPrivateKey(res2);

    // test enc / dec
    const message = "Hello, World!";
    const encrypted = encrypt.encrypt(message);
    const decrypted = encrypt.decrypt(encrypted);
    if (decrypted !== message)
    {
        alert("Decryption failed!");
        return undefined;
    }

    return {
        publicKey: res,
        privateKey: res2
    }
}

export const generateKeys = async (keySize) => {
    if (keySize === undefined)
        keySize = 2048;

    let tempRes = await genKey2(keySize);
    if (tempRes != undefined)
        return tempRes;

    const encrypt = await getJSEncrypt({default_key_size: keySize});

    await new Promise((res, rej) => {
        encrypt.getKey(() => {
            res();
        });
    })

    const publicKey = encrypt.getPublicKey();
    const privateKey = encrypt.getPrivateKey();

    // console.log("Public Key:", publicKey);
    // console.log("Private Key:", privateKey);
    return {
        publicKey: publicKey,
        privateKey: privateKey
    };
}

// export default function Home() {
//     return (
//         <div className={styles.page}>
//             <main className={styles.main}>
//                 <h1>Encryption Test</h1>
//
//                 <p>Public Key:</p>
//                 <textarea id="publicKey" rows="10" cols="50"></textarea>
//                 <br></br>
//
//                 <p>Private Key:</p>
//                 <textarea id="privateKey" rows="10" cols="50"></textarea>
//                 <br></br>
//
//                 <p>Message:</p>
//                 <textarea id="message" rows="10" cols="50"></textarea>
//                 <br></br>
//
//                 <p>Encrypted:</p>
//                 <textarea id="encrypted" rows="10" cols="50"></textarea>
//                 <br></br>
//
//                 <br></br>
//
//
//                 {/* Generate Keys */}
//                 <button onClick={async () => {
//                     // const JSEncrypt = (await import("../lib/jsencrypt.min.js")).default
//                     const encrypt = await getJSEncrypt();
//                     const publicKey = encrypt.getPublicKey();
//                     const privateKey = encrypt.getPrivateKey();
//                     console.log("Public Key:", publicKey);
//                     console.log("Private Key:", privateKey);
//                     document.getElementById("publicKey").value = publicKey;
//                     document.getElementById("privateKey").value = privateKey;
//                 }}>Generate Keys
//                 </button>
//                 <br></br>
//
//
//                 {/* Encrypt / Decrypt */}
//                 <button onClick={async () => {
//                     const publicKey = document.getElementById("publicKey").value;
//                     const privateKey = document.getElementById("privateKey").value;
//                     const message = document.getElementById("message").value;
//                     const encrypted = document.getElementById("encrypted").value;
//
//                     // const JSEncrypt = (await import("/src/app/lib/jsencrypt.min")).default
//                     const encrypt = await getJSEncrypt();
//
//                     if (encrypted === "") {
//                         encrypt.setPublicKey(publicKey);
//                         const encryptedMessage = encrypt.encrypt(message);
//                         console.log("Encrypted:", encryptedMessage);
//                         document.getElementById("encrypted").value = encryptedMessage;
//                         document.getElementById("message").value = "";
//                     }
//                     else {
//                         encrypt.setPrivateKey(privateKey);
//                         const decryptedMessage = encrypt.decrypt(encrypted);
//                         console.log("Decrypted:", decryptedMessage);
//                         document.getElementById("message").value = decryptedMessage;
//                         document.getElementById("encrypted").value = "";
//                     }
//                 }}>En/Decrypt
//                 </button>
//
//
//             </main>
//             <footer className={styles.footer}>
//                 <p>lol</p>
//                 <a href={"/"}>Home</a>
//             </footer>
//         </div>
//     );
// }

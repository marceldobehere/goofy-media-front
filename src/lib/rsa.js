'use client';

import {getCryptoJS, getHashFromObj} from "@/lib/cryptoUtils";

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
    {
        console.log("> Fast key gen successful");
        return tempRes;
    }
    else
        console.error("> Fast key gen unavailable")

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

export let GLOB_KEY = {
    publicKey: "",
    privateKey: ""
};

export const encryptObj = async (obj, publicKey) => {
    if (publicKey === undefined)
        publicKey = GLOB_KEY.publicKey;
    const encrypt = await getJSEncrypt();
    encrypt.setPublicKey(publicKey);
    return encrypt.encrypt(JSON.stringify(obj));
}

export const decryptObj = async (obj, privateKey) => {
    if (privateKey === undefined)
        privateKey = GLOB_KEY.privateKey;
    const encrypt = await getJSEncrypt();
    encrypt.setPrivateKey(privateKey);
    return JSON.parse(encrypt.decrypt(obj));
}

export const signObj = async (obj, privateKey) => {
    if (privateKey === undefined)
        privateKey = GLOB_KEY.privateKey;
    const encrypt = await getJSEncrypt();
    encrypt.setPrivateKey(privateKey);
    let hash = await getHashFromObj(obj);
    return encrypt.sign(hash, (await getCryptoJS()).SHA256, "sha256");
}

export const verifyObj = async (obj, signature, publicKey) => {
    if (publicKey === undefined)
        publicKey = GLOB_KEY.publicKey;
    const encrypt = await getJSEncrypt();
    encrypt.setPublicKey(publicKey);
    let hash = await getHashFromObj(obj);
    return encrypt.verify(hash, signature, (await getCryptoJS()).SHA256);
}

export const checkPubKeyValid = async (publicKey) => {
    const encrypt = await getJSEncrypt();
    encrypt.setPublicKey(publicKey);
    try {
        return encrypt.getPublicKey() != undefined;
    } catch (e) {
        return false;
    }
}

export const checkPrivKeyValid = async (privateKey) => {
    const encrypt = await getJSEncrypt();
    encrypt.setPrivateKey(privateKey);
    try {
        return encrypt.getPrivateKey() != undefined;
    } catch (e) {
        return false;
    }
}
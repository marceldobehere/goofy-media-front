import {getRandomIntInclusive} from "@/lib/cryptoUtils";
import {GLOB_KEY, signObj} from "@/lib/rsa";

export let baseServer = "http://localhost:3000";


export async function reqNoAuth(path, method, data) {
    let options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    // let res = await fetch(baseServer + path, options);
    // return await res.text();

    console.log("Sending request to: ", baseServer + path, " with options: ", options);
    let res = await fetch(baseServer + path, options);
    if (res.status !== 200 && res.status !== 201) {
        console.info("Failed request: ", await res.text(), res);
        return undefined;
    }

    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        return text;
    }
}

async function getSignatureAndId(body) {
    let id = getRandomIntInclusive(10000000, 10000000000);
    let validUntil = Date.now() + 1000 * 10;
    let signature = await signObj({body, id, validUntil});
    console.log("> Doing Sign of: ", {body, id, validUntil}, " got: ", signature)
    return {signature, id, validUntil, publicKey: GLOB_KEY.publicKey};
}

export async function reqWithAuth(path, method, data) {

    let {signature, id, validUntil, publicKey} = await getSignatureAndId(data);

    let options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-Goofy-Signature': signature,
            'X-Goofy-Id': id,
            'X-Goofy-Valid-Until': validUntil,
            'X-Goofy-Public-Key': encodeURIComponent(publicKey)
        }
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    console.log("Sending request to: ", baseServer + path, " with options: ", options);
    let res = await fetch(baseServer + path, options);
    if (res.status !== 200 && res.status !== 201) {
        console.info("Failed request: ", await res.text(), res);
        return undefined;
    }

    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        return text;
    }
}

export async function getWithAuth(path) {
    return await reqWithAuth(path, "GET");
}

export async function postWithAuth(path, data) {
    return await reqWithAuth(path, "POST", data);
}

export async function putWithAuth(path, data) {
    return await reqWithAuth(path, "PUT", data);
}

export async function deleteWithAuth(path) {
    return await reqWithAuth(path, "DELETE");
}

export async function getNoAuth(path) {
    return await reqNoAuth(path, "GET");
}
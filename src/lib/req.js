import {getRandomIntInclusive} from "@/lib/cryptoUtils";
import {signObj} from "@/lib/rsa";
import {GlobalStuff} from "@/lib/globalStateStuff";
import {SpinActivity} from "@/lib/spinner";


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

    let res;
    await SpinActivity(async () => {
        try {
            res = await fetch(GlobalStuff.server + path, options);
            if (res.status !== 200 && res.status !== 201) {
                console.info("> Failed request: ", await res.text(), res);
                res = undefined;
            }
        } catch (e) {
            console.info("> Failed request: ", e);
            res = undefined;
        }
    });

    if (res === undefined)
        return undefined;

    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        return text;
    }
}

async function getSignatureAndId(body) {
    if (body == undefined)
        body = {};
    let id = getRandomIntInclusive(10000000, 10000000000);
    let validUntil = Date.now() + 1000 * 10;
    let signature = await signObj({body, id, validUntil});
    // console.log("> Doing Sign of: ", {body, id, validUntil}, " got: ", signature)
    return {signature, id, validUntil, publicKey: GlobalStuff.publicKey};
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
    let res;
    await SpinActivity(async () => {
        try {
            res = await fetch(GlobalStuff.server + path, options);
            if (res.status !== 200 && res.status !== 201) {
                console.info("> Failed request: ", await res.text(), res);
                res = undefined;
            }
        } catch (e) {
            console.info("> Failed request: ", e);
            res = undefined;
        }
    });

    if (res === undefined)
        return undefined;

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
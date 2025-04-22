import {getRandomIntInclusive} from "@/lib/cryptoUtils";
import {signObj} from "@/lib/rsa";
import {GlobalStuff} from "@/lib/globalStateStuff";
import {SpinActivity} from "@/lib/spinner";


export async function reqNoAuth(path, method, data, headers, sendRawResponse, sendRawBody) {
    if (headers === undefined)
        headers = {};

    let options = {
        method: method,
        headers: headers
    };

    if (!sendRawBody)
        options.headers['Content-Type'] = 'application/json';
    if (data) {
        if (sendRawBody)
            options.body = data;
        else
            options.body = JSON.stringify(data);
    }

    let res;
    await SpinActivity(async () => {
        try {
            res = await fetch(GlobalStuff.server + path, options);
        } catch (e) {
            console.info("> Failed request: ", e);
            res = undefined;
        }
    });

    if (res === undefined)
        return undefined;

    if (sendRawResponse)
        return res;

    if (res.status !== 200 && res.status !== 201) {
        console.info("> Failed request: ", await res.text(), res);
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
    if (body == undefined)
        body = {};
    let id = getRandomIntInclusive(10000000, 10000000000);
    let validUntil = Date.now() + 1000 * 10;
    let signature = await signObj({body, id, validUntil});
    // console.log("> Doing Sign of: ", {body, id, validUntil}, " got: ", signature)
    return {signature, id, validUntil, publicKey: GlobalStuff.publicKey};
}

export async function reqWithAuth(path, method, data, headers, sendRawResponse, sendRawBody) {
    if (headers === undefined)
        headers = {};

    let {signature, id, validUntil, publicKey} = await getSignatureAndId(sendRawBody ? "FILE" : data);

    let options = {
        method: method,
        headers: {
            'X-Goofy-Signature': encodeURIComponent(signature),
            'X-Goofy-Id': id,
            'X-Goofy-Valid-Until': validUntil,
            'X-Goofy-Public-Key': encodeURIComponent(publicKey),
            'X-Goofy-RAW': !!sendRawBody,
            ...headers
        }
    };
    if (!sendRawBody)
        options.headers['Content-Type'] = 'application/json';
    if (data) {
        if (sendRawBody)
            options.body = data;
        else
            options.body = JSON.stringify(data);
    }
    let res;
    await SpinActivity(async () => {
        try {
            if (GlobalStuff.server == undefined) {
                console.error("Main Server undefined: ", GlobalStuff)
                alert("Main Server is undefined!\nProbably attempting to fetch data before initialized?");
            } else
                res = await fetch(GlobalStuff.server + path, options);
        } catch (e) {
            console.info("> Failed request: ", e);
            res = undefined;
        }
    });

    if (res === undefined)
        return undefined;

    if (sendRawResponse) {
        return res;
    }

    if (res.status !== 200 && res.status !== 201) {
        console.info("> Failed sent request: ", await res.text(), res, GlobalStuff.server, path);
        return undefined;
    }

    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        return text;
    }
}

export async function getWithAuth(path, headers, sendRawResponse) {
    return await reqWithAuth(path, "GET", undefined, headers, sendRawResponse, false);
}

export async function postWithAuth(path, data, headers, sendRawResponse) {
    return await reqWithAuth(path, "POST", data, headers, sendRawResponse, false);
}

export async function rawPostWithAuth(path, data, headers, sendRawResponse) {
    return await reqWithAuth(path, "POST", data, headers, sendRawResponse, true);
}

export async function putWithAuth(path, data, headers, sendRawResponse) {
    return await reqWithAuth(path, "PUT", data, headers, sendRawResponse, false);
}

export async function deleteWithAuth(path, headers, sendRawResponse) {
    return await reqWithAuth(path, "DELETE", undefined, headers, sendRawResponse, false);
}

export async function getNoAuth(path, headers, sendRawResponse) {
    return await reqNoAuth(path, "GET", undefined, headers, sendRawResponse, false);
}

export async function postNoAuth(path, data, headers, sendRawResponse) {
    return await reqNoAuth(path, "POST", data, headers, sendRawResponse, false);
}
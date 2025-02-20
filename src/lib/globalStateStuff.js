'use client';

import {userHash} from "@/lib/cryptoUtils";
import {postWithAuth} from "@/lib/req";

let initReadyRes;
export const initReady = new Promise((res, rej) => {
    initReadyRes = res;
});

export const initReadyCallbackList = [];

export let GlobalStuff = {
    loggedIn: false,
    server: "",
    publicKey: null,
    privateKey: null,
    userId: null,
};

let initDone = false;
export async function initGlobalState(callback) {
    // console.info("> Attempt initGlobalState");
    if (initDone)
        return;
    initDone = true;
    // console.info("> initGlobalState");

    await loadGlobalState();
    if (GlobalStuff.publicKey !== null) {
        let userId = await userHash(GlobalStuff.publicKey);
        GlobalStuff.userId = userId;
    }
    GlobalStuff.loggedIn = GlobalStuff.publicKey !== null;

    if (GlobalStuff.loggedIn) {
        let res = await postWithAuth("/guest/register/login-test", {});
        if (res === undefined) {
            alert("Login test failed!");

            GlobalStuff.publicKey = null;
            GlobalStuff.privateKey = null;
            GlobalStuff.userId = null;
            GlobalStuff.loggedIn = false;
            await saveGlobalState();

            return;
        }
    }

    initReadyRes();
    // initReadyCallbackList.reverse();
    for (let cb of initReadyCallbackList)
        try {
            cb();
        } catch (e) {
            console.info("> Error in initReadyCallbackList: ", e);
        }

    try {
        await callback();
    } catch (e) {
        console.info("> Error in initGlobalState callback: ", e);
    }
}

export async function loadKey(key) {
    return localStorage.getItem(key);
}

export async function saveKey(key, value) {
    localStorage.setItem(key, value);
}

export async function removeKey(key) {
    localStorage.removeItem(key);
}

export async function loadKeyOrDefault(key, defaultValue) {
    let val = await loadKey(key);
    if (val != null)
        return val;

    await saveKey(key, defaultValue);
    return defaultValue;
}

export async function saveKeyObj(key, key2, value) {
    let obj = await loadKey(key);
    obj[key2] = value;
    await saveKey(key, obj);

}

export async function loadGlobalState() {
    GlobalStuff = {};
    GlobalStuff.server = await loadKeyOrDefault("server", "http://localhost:3000");
    GlobalStuff.publicKey = await loadKey("publicKey");
    GlobalStuff.privateKey = await loadKey("privateKey");
}

export async function saveGlobalState() {
    await saveKey("server", GlobalStuff.server);
    await saveKey("publicKey", GlobalStuff.publicKey);
    await saveKey("privateKey", GlobalStuff.privateKey);
}

export async function saveGlobalStateKey(key, value) {
    GlobalStuff[key] = value;
    await saveGlobalState();
}

export async function logout() {
    GlobalStuff.publicKey = null;
    GlobalStuff.privateKey = null;
    GlobalStuff.userId = null;
    GlobalStuff.loggedIn = false;
    await saveGlobalState();
}
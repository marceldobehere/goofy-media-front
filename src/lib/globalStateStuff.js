'use client';

import {userHash} from "@/lib/cryptoUtils";
import {getWithAuth, postWithAuth} from "@/lib/req";
import {goPath} from "@/lib/goPath";
import {SpinActivity} from "@/lib/spinner";

export const initReadyCallbackList = [];

export let GlobalStuff = {
    loggedIn: false,
    server: "",
    publicKey: null,
    privateKey: null,
    userId: null,
    lastCheck: null,
    admin: false
};


let lastPath = undefined;

export async function initGlobalState(pathName, needLogin, needAdmin, callback) {
    pathName = pathName.split("#")[0];
    console.info("> Starting Global State Init: ", pathName);
    if (lastPath == pathName)
        return;
    lastPath = pathName;
    await SpinActivity(async () => {
        console.info("> Starting Global State Init");

        await loadGlobalState();
        const userIdNull = GlobalStuff.userId === null || GlobalStuff.userId === "";
        const fiveDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 5;
        const needsCheck = GlobalStuff.lastCheck === null ||
            GlobalStuff.lastCheck < fiveDaysAgo ||
            GlobalStuff.lastCheck > Date.now();
        if (GlobalStuff.publicKey !== null && (userIdNull || needsCheck)) {
            console.info("> Attempting to get userId: ", GlobalStuff.publicKey, userIdNull, needsCheck);
            let userId = await userHash(GlobalStuff.publicKey);
            GlobalStuff.userId = userId;
            GlobalStuff.lastCheck = Date.now();
            await saveGlobalState();
            console.info("> Got userId: ", userId);
        }
        GlobalStuff.loggedIn = GlobalStuff.publicKey !== null;

        if (GlobalStuff.loggedIn && needLogin) {
            let res = await getWithAuth("/user/verify");
            if (res === undefined) {
                // alert("Login test failed!");

                GlobalStuff.publicKey = null;
                GlobalStuff.privateKey = null;
                GlobalStuff.userId = null;
                GlobalStuff.loggedIn = false;
                await saveGlobalState();

                return;
            }
            console.info("> Login test successful");
        }

        if (GlobalStuff.loggedIn && needAdmin) {
            let res = await getWithAuth("/admin/verify");
            if (res === undefined) {
                GlobalStuff.admin = false;
                // alert("Admin test failed!");
                goPath("/user/home");
                return;
            }
            console.info("> Admin test successful");
            GlobalStuff.admin = true;
        }
    });

    console.info("> Global State Init Done");

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
    try {
        return JSON.parse(LsGet(key));
    } catch (e) {
        return null;
    }
}

export async function saveKey(key, value) {
    LsSet(key, JSON.stringify(value));
}

export async function removeKey(key) {
    LsDel(key);
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
    GlobalStuff.server = await loadKeyOrDefault("server", "https://media.marceldobehere.com"); // http://localhost:3000");
    GlobalStuff.publicKey = await loadKey("publicKey");
    GlobalStuff.privateKey = await loadKey("privateKey");
    GlobalStuff.userId = await loadKey("userId");
    GlobalStuff.lastCheck = await loadKey("lastCheck");

    console.info("> Loaded Global State");
}

export async function saveGlobalState() {
    await saveKey("server", GlobalStuff.server);
    await saveKey("publicKey", GlobalStuff.publicKey);
    await saveKey("privateKey", GlobalStuff.privateKey);
    await saveKey("userId", GlobalStuff.userId);
    await saveKey("lastCheck", GlobalStuff.lastCheck);

    console.info("> Saved Global State");
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
    GlobalStuff.lastCheck = null;
    await saveGlobalState();
}

const ENV_LS_OFFSET = "__GOOFY_MEDIA__";

function LsGet(key) {
    return localStorage.getItem(ENV_LS_OFFSET + key);
}

function LsSet(key, value) {
    localStorage.setItem(ENV_LS_OFFSET + key, value);
}

function LsDel(key) {
    localStorage.removeItem(ENV_LS_OFFSET + key);
}
'use client';

import {userHash} from "@/lib/cryptoUtils";
import {getWithAuth, postWithAuth} from "@/lib/req";
import {goPath} from "@/lib/goPath";
import {SpinActivity} from "@/lib/spinner";
import {initLocalSettings} from "@/lib/localSettings";
import {overrideFetch} from "@/lib/customFetch";
import {useEffect} from "react";

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
let lastPathPromise = undefined;
let lastPathPromiseResolve = undefined;
overrideFetch();

async function runMaybeAsyncCallback(fn) {
    if (fn === undefined)
        return;
    try {
        await fn();
    } catch (e) {
        console.info("> Error in callback: ", e);
    }
}

export function useGlobalState(pathName, needLogin, needAdmin, doneCallBack, preCallback) {
    useEffect(() => {
        runMaybeAsyncCallback(preCallback).then(() => {
            initGlobalState(pathName, needLogin, needAdmin).then(async () => {
                runMaybeAsyncCallback(doneCallBack).then();
            });
        });
    }, [pathName])
}


export async function initGlobalState(pathName, needLogin, needAdmin, callback) {
    pathName = pathName.split("#")[0];
    console.info("> Starting Global State Init: ", pathName);
    if (lastPath == pathName) {
        console.info("> Already initialized for this path");
        await lastPathPromise;
        return;
    }
    lastPathPromise = new Promise((resolve) => {
        lastPathPromiseResolve = resolve;
    });
    lastPath = pathName;

    try {
        await initLocalSettings();
    } catch (e) {
        console.info("> Error in initLocalSettings: ", e);
    }

    {
        const queryParams = new URLSearchParams(window.location.search);
        const serverId = queryParams.get("serverId");
        if (serverId !== null) {
            sessionStorage.setItem("tempServerIdOverride", serverId);
        }
    }

    await SpinActivity(async () => {
        console.info("> Starting Global State Init");

        await loadGlobalState();
        const tempServerIdOverride = sessionStorage.getItem("tempServerIdOverride");
        if (tempServerIdOverride !== null) {
            GlobalStuff.server = tempServerIdOverride;
            console.info("> Server override: ", GlobalStuff.server);
        }

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
            let res = await getWithAuth("/user/verify", null, true);
            console.log("> Login test: ", res);
            if (res === undefined || res.status != 200) {
                // alert("Login test failed!");

                if (res !== undefined && res.status === 401) {
                    GlobalStuff.publicKey = null;
                    GlobalStuff.privateKey = null;
                    GlobalStuff.userId = null;
                    GlobalStuff.loggedIn = false;
                    await saveGlobalState();
                } else {
                    alert("Network error, please try again later");
                }

                return;
            }
            console.info("> Login test successful");
        }

        if (GlobalStuff.loggedIn) {
            let res = await getWithAuth("/admin/verify", null, true);
            if (res === undefined || res.status != 200) {
                GlobalStuff.admin = false;
                // alert("Admin test failed!");
                if (needAdmin)
                    goPath("/user/home");
            } else {
                // console.info("> Admin test successful");
                GlobalStuff.admin = true;
            }
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
        if (callback)
            await callback();
    } catch (e) {
        console.info("> Error in initGlobalState callback: ", e);
    }

    lastPathPromiseResolve();
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
    // GlobalStuff.admin = await loadKeyOrDefault("admin", false);

    console.info("> Loaded Global State");
}

export async function saveGlobalState(forceSaveServer) {
    if (forceSaveServer) {
        sessionStorage.removeItem("tempServerIdOverride");
        await saveKey("server", GlobalStuff.server);
    }
    await saveKey("publicKey", GlobalStuff.publicKey);
    await saveKey("privateKey", GlobalStuff.privateKey);
    await saveKey("userId", GlobalStuff.userId);
    await saveKey("lastCheck", GlobalStuff.lastCheck);
    // await saveKey("admin", GlobalStuff.admin);

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
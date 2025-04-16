'use client';

import {convertCssString} from "@/lib/customCssConverter";

const defaultTrustedUrls = ["https://buzzheavier.com/", "https://cdn.marceldobehere.com/", "https://www.dropbox.com/", "https://files.catbox.moe/"];

export let LocalSettings = {
    autoLoadMedia: false,
    autoLoadMediaFromTrustedUrls: true,
    trustedAutoLoadMediaUrls: [],
    enabledCustomPostCss: true,
    enabledCustomPostAnimations: true,
    customCss: "",
    openPostInNewTab: true,
    extendPostClickHitbox: false,
    overrideShowGlobalFeed: false,
};

async function customCssReady() {
    const elem = document.getElementById("custom-post-css");
    return elem !== null;
}

async function initCustomCss() {
    if (await customCssReady())
        return;

    const elem = document.createElement("style");
    elem.id = "custom-post-css";
    elem.innerHTML = convertCssString(LocalSettings.customCss);
    // add to head
    document.head.appendChild(elem);
}

async function updateCustomCss() {
    if (! await customCssReady())
        await initCustomCss();

    document.getElementById("custom-post-css").innerHTML = convertCssString(LocalSettings.customCss);
}

export async function initLocalSettings(callback) {
    console.info("> Starting Local Settings Init");
    await loadLocalSettings();

    await initCustomCss();
    console.info("> Local Settings Init Done");

    try {
        if (callback !== undefined)
            await callback();
    } catch (e) {
        console.info("> Error in initLocalSettings callback: ", e);
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

export async function loadLocalSettings() {
    LocalSettings = {};
    LocalSettings.autoLoadMedia = await loadKeyOrDefault("autoLoadMedia", false);
    LocalSettings.autoLoadMediaFromTrustedUrls = await loadKeyOrDefault("autoLoadMediaFromTrustedUrls", true);
    LocalSettings.trustedAutoLoadMediaUrls = await loadKeyOrDefault("trustedAutoLoadMediaUrls", defaultTrustedUrls);
    LocalSettings.enabledCustomPostCss = await loadKeyOrDefault("enabledCustomPostCss", true);
    LocalSettings.enabledCustomPostAnimations = await loadKeyOrDefault("enabledCustomPostAnimations", true);
    LocalSettings.customCss = await loadKeyOrDefault("customCss", "");
    LocalSettings.openPostInNewTab = await loadKeyOrDefault("openPostInNewTab", true);
    LocalSettings.extendPostClickHitbox = await loadKeyOrDefault("extendPostClickHitbox", false);
    LocalSettings.overrideShowGlobalFeed = await loadKeyOrDefault("overrideShowGlobalFeed", false);

    console.info("> Loaded Local Settings");
}

export async function saveLocalSettings() {
    await saveKey("autoLoadMedia", LocalSettings.autoLoadMedia);
    await saveKey("autoLoadMediaFromTrustedUrls", LocalSettings.autoLoadMediaFromTrustedUrls);
    await saveKey("trustedAutoLoadMediaUrls", LocalSettings.trustedAutoLoadMediaUrls);
    await saveKey("enabledCustomPostCss", LocalSettings.enabledCustomPostCss);
    await saveKey("enabledCustomPostAnimations", LocalSettings.enabledCustomPostAnimations);
    await saveKey("customCss", LocalSettings.customCss);
    await saveKey("openPostInNewTab", LocalSettings.openPostInNewTab);
    await saveKey("extendPostClickHitbox", LocalSettings.extendPostClickHitbox);
    await saveKey("overrideShowGlobalFeed", LocalSettings.overrideShowGlobalFeed);

    await updateCustomCss();

    console.info("> Saved Local Settings: ", LocalSettings);
}

export async function saveLocalSettingsKey(key, value) {
    LocalSettings[key] = value;
    await saveLocalSettings();
}


const ENV_LS_OFFSET = "__GOOFY_MEDIA__LOCAL_SETTINGS__";

function LsGet(key) {
    return localStorage.getItem(ENV_LS_OFFSET + key);
}

function LsSet(key, value) {
    localStorage.setItem(ENV_LS_OFFSET + key, value);
}

function LsDel(key) {
    localStorage.removeItem(ENV_LS_OFFSET + key);
}
'use client';

export let LocalSettings = {
    autoLoadMedia: false
};

export async function initLocalSettings(callback) {
    console.info("> Starting Local Settings Init");
    await loadLocalSettings();

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

    console.info("> Loaded Local Settings");
}

export async function saveLocalSettings() {
    await saveKey("autoLoadMedia", LocalSettings.autoLoadMedia);

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
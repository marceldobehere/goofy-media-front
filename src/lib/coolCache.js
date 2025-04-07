'use client';

export class AsyncLock {
    constructor() {
        this.promiseArr = [];
        this.resolveArr = [];
    }

    disable() {
        if (this.resolveArr.length > 0) {
            if (logLock)
                console.log("Disabling lock");

            this.promiseArr.shift();
            this.resolveArr.shift()();
        } else
            alert("Invalid lock disable")
    }

    async enable() {
        if (logLock)
            console.log("Enabling lock");

        let tempPromises = [];
        for (let prom of this.promiseArr)
            tempPromises.push(prom);
        let bigPromise = Promise.all(tempPromises);

        let resolve;
        let promise = new Promise(r => resolve = r);
        this.promiseArr.push(promise);
        this.resolveArr.push(resolve);

        await bigPromise;
    }

    isLocked() {
        return this.resolveArr.length > 0;
    }

    reset() {
        this.promiseArr = [];
        this.resolveArr = [];
    }

    async tryEnable() {
        if (logLock)
            console.log("Trying to enable lock");

        if (this.resolveArr.length > 0)
            return false;

        await this.enable();
        return true;
    }

    async do(func) {
        await this.enable();
        try {
            let res = await func();
            this.disable();
            return res;
        } catch (e) {
            this.disable();
            console.error("Error: ", e);
        }
    }
};


// Cool Cache Class
// Used to store things that might take a long while to compute / lookup
// Simple Function to fetch or load data if needed + Supports promises + maybe supports timeout
// Also supports having the cache be in localstorage
// + Max Size
// Each entry will consist of the key, the value and the last access time
// When the cache is full, the oldest entries will be removed

async function attemptToRunFunctionWithTimeout(func, timeout) {
    if (timeout == undefined) {
        return await func();
    }

    return await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error("Function timed out"));
        }, timeout);

        func().then((result) => {
            clearTimeout(timer);
            resolve(result);
        }).catch((error) => {
            clearTimeout(timer);
            reject(error);
        });
    });
}


export class CoolCache {
    constructor(
        {maxSize = 1000, loadTimeout = null, cacheEntryTimeout, localStorageKey = null, extLoadFunc = null, saveToLocalStorageFreq = 1}
        = {}) {
        if (typeof window === 'undefined')
            return;

        this.maxSize = maxSize;
        this.loadTimeout = loadTimeout;
        this.cacheEntryTimeout = cacheEntryTimeout;
        this.localStorageKey = localStorageKey;
        this.saveToLocalStorageFreq = saveToLocalStorageFreq;
        this.saveToLocalStorageCounter = 0;

        this.extLoadFunc = extLoadFunc;

        this.setAsyncLock = new AsyncLock();
        this.cache = new Map();
        this.readyResolver = null;
        this.readyPromise = new Promise((resolve) => {
            this.readyResolver = resolve;
        });

        if (localStorageKey) {
            this.loadFromLocalStorage().then(this.readyResolver).catch(console.error);
        } else if (extLoadFunc) {
            this.loadFromExternal().then(this.readyResolver).catch(console.error);
        } else {
            this.readyResolver();
        }

        console.log("> Cache Created: ", this)
    }

    async loadFromExternal() {

    }

    async loadFromLocalStorage()  {
        if (this.localStorageKey == null) {
            return;
        }

        console.log("> Loading from local storage: ", this.localStorageKey);

        const data = LsGet(this.localStorageKey);
        if (data == null) {
            console.log("> No data found in local storage");
            return;
        }

        try {
            const parsedData = JSON.parse(data);
            if (parsedData.cache) {
                for (const entry of parsedData.cache) {
                    this.cache.set(entry.key, {
                        value: entry.value,
                        lastAccess: entry.lastAccess
                    });
                }
            }

            if (parsedData.lastAccess) {
                this.lastAccess = parsedData.lastAccess;
            }
        } catch (e) {
            console.error("Error parsing local storage data: ", e);
            LsDel(this.localStorageKey);
            return;
        }
    }

    async saveToLocalStorage() {
        if (this.localStorageKey == null) {
            return;
        }

        const cacheData = Array.from(this.cache.entries()).map(([key, {value, lastAccess}]) => ({
            key,
            value,
            lastAccess
        }));

        const dataToSave = {
            cache: cacheData,
            lastAccess: Date.now()
        };

        console.log(`> Saving Cache to Localstorage at ${this.localStorageKey}: `, dataToSave);

        LsSet(this.localStorageKey, JSON.stringify(dataToSave));
    }

    async doSave() {
        if (this.localStorageKey == null) {
            return;
        }

        try {
            await this.saveToLocalStorage();
        } catch (e) {
            console.error("Error saving to local storage: ", e);
        }
    }

    async maybeSave() {
        this.saveToLocalStorageCounter++;
        if (this.saveToLocalStorageCounter >= this.saveToLocalStorageFreq) {
            this.saveToLocalStorageCounter = 0;
            await this.doSave();
        }
    }

    async get(key, loadFunc) {
        await this.readyPromise;
        const now = Date.now();

        // Check if the cache contains the key
        if (this.cache.has(key)) {
            const entry = this.cache.get(key);
            if (this.cacheEntryTimeout && entry.lastAccess + this.cacheEntryTimeout < now) {
                this.cache.delete(key);
                // Cache entry expired
                // Continue to load
            } else {
                entry.lastAccess = now;
                if (entry.promise) {
                    try {
                        return await entry.promise;
                    } catch (e) {
                        return null;
                    }
                } else {
                    return entry.value;
                }
            }
        }

        // Try to load the value if it doesn't exist
        if (loadFunc) {
            let promiseRes = undefined;
            let promiseRej = undefined;
            const valuePromise = new Promise((resolve, reject) => {
                promiseRes = resolve;
                promiseRej = reject;
            });

            this.cache.set(key, {
                value: undefined,
                promise: valuePromise,
                lastAccess: Date.now()
            });

            try {
                const value = await attemptToRunFunctionWithTimeout(loadFunc, this.loadTimeout);
                promiseRes(value);

                // Update the cache with the new value
                this.cache.set(key, {
                    value,
                    promise: undefined,
                    lastAccess: Date.now()
                });

                // Maybe save to local storage
                await this.maybeSave();

                return value;
            } catch (e) {
                console.info(`Error loading value for key ${key}:`, e);
                promiseRej(e);
            }
        }

        return null;
    }

    async set(key, value) {
        await this.readyPromise;
        await this.setAsyncLock.do(async () => {
            await this.readyPromise;
            const now = Date.now();

            await this.trimToSize();

            // Add the new entry to the cache
            this.cache.set(key, {
                value,
                lastAccess: now
            });

            // Maybe save to local storage
            await this.maybeSave();
        });
    }

    async delete(key) {
        await this.readyPromise;
        if (this.cache.has(key)) {
            this.cache.delete(key);
            await this.doSave();
        }
    }

    async clear() {
        await this.readyPromise;
        this.cache.clear();
        await this.doSave();
    }

    async trimToSize() {
        while (this.cache.size > 1 &&
            this.cache.size >= this.maxSize) {
            // Remove the oldest entry
            let oldestKey = null;
            let oldestTime = Infinity;

            for (const [k, v] of this.cache.entries()) {
                if (v.lastAccess < oldestTime) {
                    oldestTime = v.lastAccess;
                    oldestKey = k;
                }
            }

            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }
    }
}


const ENV_LS_OFFSET = "__GOOFY_MEDIA__LOCAL_COOL_CACHE__";

function LsGet(key) {
    return localStorage.getItem(ENV_LS_OFFSET + key);
}

function LsSet(key, value) {
    localStorage.setItem(ENV_LS_OFFSET + key, value);
}

function LsDel(key) {
    localStorage.removeItem(ENV_LS_OFFSET + key);
}

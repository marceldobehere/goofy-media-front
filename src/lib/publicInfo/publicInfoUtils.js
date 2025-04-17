'use client';

import {getNoAuth, getWithAuth, postWithAuth} from "@/lib/req";
import {signObj, verifyObj} from "@/lib/rsa";
import {userHash} from "@/lib/cryptoUtils";
import {CoolCache} from "@/lib/coolCache";


export const publicKeyCache = new CoolCache({localStorageKey: "PUBLIC_KEYS"});
export async function getPublicKeyFromUserId(userId) {
    if (userId === undefined || typeof userId !== 'string') {
        console.error("> User ID MISSING");
        return undefined;
    }

    const publicKey = publicKeyCache.get(userId, async () => {
        console.log("> Getting public key for userId: ", userId);
        const res = await getWithAuth(`/user/user-data/${userId}/public-key`);
        if (res === undefined || res.publicKey === undefined) {
            console.info("> Failed to request public key for userId: ", userId);
            throw new Error("Failed to request public key");
        }

        // verify userid -> key mapping
        const actualUserId = await userHash(res.publicKey);
        if (userId !== actualUserId) {
            console.info("> User ID MISMATCH: ", userId, " != ", actualUserId);
            throw new Error("User ID mismatch");
        }

        console.log("> Got public key for userId: ", userId, " -> ", res.publicKey);

        return res.publicKey;
    });

    if (publicKey == undefined) {
        console.error("> Failed to get public key for userId: ", userId);
        return undefined;
    }

    return publicKey;
}

export const displayNameCache = new CoolCache({localStorageKey: "DISPLAY_NAMES", cacheEntryTimeout: 1000  * 60 * 30});
export const recentlyFailedDisplayNamesCache = new CoolCache({localStorageKey: "DISPLAY_NAMES_FAILED", cacheEntryTimeout: 1000  * 60 * 5});

export async function getDisplayNameFromUserId(userId) {
    if (userId === undefined || typeof userId !== 'string') {
        console.info("> User ID MISSING");
        return undefined;
    }

    // Check if we have a cached value
    const recentlyFailed = await recentlyFailedDisplayNamesCache.get(userId);
    if (recentlyFailed) {
        console.info("> Recently failed to get display name for userId: ", userId);
        return undefined;
    }

    const displayName = displayNameCache.get(userId, async () => {
        console.log("> Getting display name for userId: ", userId);
        const publicInfo = await getPublicInfoForUser(userId, true);
        if (publicInfo === undefined || publicInfo.displayName == undefined || publicInfo.displayName == "") {
            console.info("> Failed to request public info for userId: ", userId);

            await recentlyFailedDisplayNamesCache.set(userId, true);
            console.log(recentlyFailedDisplayNamesCache);
            throw new Error("Failed to request public info");
        }

        console.log("> Got display name for userId: ", userId, " -> ", publicInfo.displayName);
        await recentlyFailedDisplayNamesCache.delete(userId);
        return publicInfo.displayName;
    });

    if (displayName == undefined) {
        console.error("> Failed to get display name for userId: ", userId);
        return undefined;
    }

    return displayName;
}


export async function getPublicInfoForUser(userId, inside) {
    if (userId === undefined || typeof userId !== 'string') {
        console.info("> User ID MISSING");
        return undefined;
    }

    const res = await getNoAuth(`/user/public-info/user/${userId}`);
    if (res === undefined) {
        console.info("> Failed to get public info for userId: ", userId);
        return undefined;
    }

    const publicInfo = await sanitizePublicInfo(res);
    if (publicInfo === undefined) {
        console.error("> Failed to sanitize public info for userId: ", userId);
        return undefined;
    }

    const valid = await validatePublicInfo(publicInfo);
    if (valid !== "OK") {
        console.error("> Public Info validate failed: ", valid, publicInfo);
        return undefined;
    }

    if (!inside) {
        await displayNameCache.delete(userId);
        await recentlyFailedDisplayNamesCache.delete(userId);
    }

    return publicInfo;
}


export async function setPublicInfo(infoObj) {
    const publicInfo = {
        userId: infoObj.userId,
        displayName: infoObj.displayName,
        profileBio: infoObj.profileBio,
        profilePronouns: infoObj.profilePronouns,
        profileLinks: infoObj.profileLinks,
        profileCustomCSS: infoObj.profileCustomCSS,
        profilePictureUrl: infoObj.profilePictureUrl,
        profileBannerUrl: infoObj.profileBannerUrl,
        pinnedPostUuid: infoObj.pinnedPostUuid,
        updatedAt: Date.now()
    };

    const signature = await signObj(publicInfo);

    const mainBody = {
        ...publicInfo,
        signature: signature
    };

    const res = await postWithAuth("/user/public-info/user", {publicInfo: mainBody});
    if (res === undefined)
        return false;

    await recentlyFailedDisplayNamesCache.delete(infoObj.userId);
    await publicKeyCache.delete(infoObj.userId);

    return true;
}


export async function sanitizePublicInfo(publicInfo) {
    return {
        userId: publicInfo.userId,
        displayName: publicInfo.displayName,
        profileBio: publicInfo.profileBio,
        profilePronouns: publicInfo.profilePronouns,
        profileLinks: publicInfo.profileLinks,
        profileCustomCSS: publicInfo.profileCustomCSS,
        profilePictureUrl: publicInfo.profilePictureUrl,
        profileBannerUrl: publicInfo.profileBannerUrl,
        pinnedPostUuid: publicInfo.pinnedPostUuid,
        updatedAt: publicInfo.updatedAt,
        signature: publicInfo.signature
    };
}

export async function validatePublicInfo(publicInfo) {
    if (typeof publicInfo !== "object")
        return "Public Info is not an object";

    // Basic Info

    const userId = publicInfo.userId;
    if (typeof userId !== "string")
        return "Public Info userId is not a string";

    if (typeof publicInfo.displayName !== "string")
        return "Public Info displayName is not a string";
    if (publicInfo.displayName.length < 0 || publicInfo.displayName.length > 100)
        return "Public Info displayName is not between 0 and 100 characters";

    if (typeof publicInfo.profileBio !== "string")
        return "Public Info profileBio is not a string";
    if (publicInfo.profileBio.length < 0 || publicInfo.profileBio.length > 2000)
        return "Public Info profileBio is not between 0 and 2000 characters";

    if (typeof publicInfo.profilePronouns !== "string")
        return "Public Info profilePronouns is not a string";
    if (publicInfo.profilePronouns.length < 0 || publicInfo.profilePronouns.length > 100)
        return "Public Info profilePronouns is not between 0 and 100 characters";

    if (typeof publicInfo.profileLinks !== "string")
        return "Public Info profileLinks is not a string";
    if (publicInfo.profileLinks.length < 0 || publicInfo.profileLinks.length > 1000)
        return "Public Info profileLinks is not between 0 and 1000 characters";

    if (typeof publicInfo.profileCustomCSS !== "string")
        return "Public Info profileCustomCSS is not a string";
    if (publicInfo.profileCustomCSS.length < 0 || publicInfo.profileCustomCSS.length > 3000)
        return "Public Info profileCustomCSS is not between 0 and 3000 characters";

    // URLS

    if (publicInfo.profilePictureUrl === null)
        publicInfo.profilePictureUrl = undefined;
    if (publicInfo.profileBannerUrl === null)
        publicInfo.profileBannerUrl = undefined;
    if (publicInfo.pinnedPostUuid === null)
        publicInfo.pinnedPostUuid = undefined;

    if (typeof publicInfo.profilePictureUrl !== "string" && publicInfo.profilePictureUrl != undefined)
        return "Public Info profilePictureUrl is not a string";
    if (publicInfo.profilePictureUrl != undefined && publicInfo.profilePictureUrl.length > 200)
        return "Public Info profilePictureUrl is not between 1 and 1000 characters";

    if (typeof publicInfo.profileBannerUrl !== "string" && publicInfo.profileBannerUrl != undefined)
        return "Public Info profileBannerUrl is not a string";
    if (publicInfo.profileBannerUrl != undefined && publicInfo.profileBannerUrl.length > 200)
        return "Public Info profileBannerUrl is not between 1 and 1000 characters";

    if (typeof publicInfo.pinnedPostUuid !== "string" && publicInfo.pinnedPostUuid != undefined)
        return "Public Info pinnedPostUuid is not a string";

    // Date

    if (typeof publicInfo.updatedAt !== "number")
        return "Public Info updatedAt is not a number";
    if (new Date(publicInfo.updatedAt).toString() === 'Invalid Date') {
        return "INVALID DATE";
    }
    if (publicInfo.updatedAt > Date.now() + 10000) {
        return "FUTURE DATE";
    }

    // Check if userId is a valid user

    // Get Public Key
    const publicKey = await getPublicKeyFromUserId(userId);
    if (publicKey === undefined) {
        return "USER NOT FOUND";
    }

    // Validate User ID
    const actualUserId = await userHash(publicKey);
    if (userId !== actualUserId) {
        return "USER ID MISMATCH";
    }

    // Signature

    const signature = publicInfo.signature;
    if (typeof signature !== "string")
        return "Public Info signature is not a string";

    // Validate Signature

    const _publicInfo = {
        userId: publicInfo.userId,
        displayName: publicInfo.displayName,
        profileBio: publicInfo.profileBio,
        profilePronouns: publicInfo.profilePronouns,
        profileLinks: publicInfo.profileLinks,
        profileCustomCSS: publicInfo.profileCustomCSS,
        profilePictureUrl: publicInfo.profilePictureUrl,
        profileBannerUrl: publicInfo.profileBannerUrl,
        pinnedPostUuid: publicInfo.pinnedPostUuid,
        updatedAt: publicInfo.updatedAt
    };
    const verified = await verifyObj(_publicInfo, signature, publicKey);
    if (!verified) {
        return "SIGNATURE INVALID";
    }

    return "OK";
}
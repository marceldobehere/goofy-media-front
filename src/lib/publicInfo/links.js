'use client';


import {basePath} from "@/lib/goPath";
import {GlobalStuff} from "@/lib/globalStateStuff";

export function getPostUrl(postUuid) {
    return `${basePath}/user/post?uuid=${encodeURIComponent(postUuid)}&serverId=${encodeURIComponent(GlobalStuff.server)}`;
}

export function getProfileUrl(userId) {
    return `${basePath}/user/profile?userId=${encodeURIComponent(userId)}&serverId=${encodeURIComponent(GlobalStuff.server)}`;
}

export function getSearchWithTagUrl(tag) {
    return `${basePath}/guest/search?tag=${encodeURIComponent(tag)}`;
}
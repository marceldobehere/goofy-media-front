'use client';

import config from "@/../next.config.mjs"

export const basePath = config.basePath;

export function goPath(path, newTab) {
    if (newTab)
        window.open(basePath + path, "_blank").focus();
    else
        window.location.href = basePath + path;
}

export function refreshPage() {
    window.location.reload();
}
'use client';

import config from "@/../next.config.mjs"

export const basePath = config.basePath;

export function goPath(path) {
    window.location.href = basePath + path;
}
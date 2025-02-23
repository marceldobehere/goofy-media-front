import config from "@/../next.config.mjs"

export function goPath(path) {
    window.location.href = config.basePath + path;
}
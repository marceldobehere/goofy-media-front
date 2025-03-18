export const sleep = async (ms) => new Promise(r => setTimeout(r, ms));

export function fixServerUrl(server) {
    // remove trailing slash
    if (server.endsWith("/"))
        server = server.substring(0, server.length - 1);

    // check if server has http or https, if yes early out
    if (server.startsWith("http://") || server.startsWith("https://"))
        return server;

    // check if server has a port which is 443
    if (server.includes(":443"))
        return "https://" + server;

    // check if server has a port which is 80
    if (server.includes(":80"))
        return "http://" + server;

    // all other ports will be assumed to be http
    if (server.includes(":"))
        return "http://" + server;

    // if no port is specified, assume https
    return "https://" + server;
}
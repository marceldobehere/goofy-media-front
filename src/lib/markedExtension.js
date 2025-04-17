'use client';
import hljs from "@/lib/highlight/highlight";
import {getRandomIntInclusive} from "@/lib/cryptoUtils";
import {LocalSettings} from "@/lib/localSettings";
import postStyles from "@/app/user/home/entries/postCss.module.css";
import {CoolCache} from "@/lib/coolCache";
import {basePath, goPath} from "@/lib/goPath";
import {GlobalStuff} from "@/lib/globalStateStuff";
import marked from "@/lib/marked";
import DOMPurify from "@/lib/purify";
import {getPublicKeyFromUserId} from "@/lib/publicInfo/publicInfoUtils";
let idSet = new Set();

function waitForElm(selector, func) {
    if (idSet.has(selector))
        return;
    idSet.add(selector);
    // console.log("> Waiting for element: ", selector, idSet);

    const observer = new MutationObserver(mutations => {
        if (document.querySelector(selector)) {
            // console.log("> Found element: ", selector);
            // observer.disconnect();
            const elem = document.querySelector(selector);
            elem.id = `done-${elem.id}`;
            func(elem);
        }
    });

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

const UrlElementCache = new CoolCache();

const doesExistCache = new CoolCache();
const doesImageExist = async (url) => {
    return await doesExistCache.get(`IMG_${url}`, async () => {
        return await new Promise(async (resolve) => {
            const img = new Image();

            img.src = url;
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
        });
    })
}
const doesVideoExist = async (url) => {
    return await doesExistCache.get(`VID_${url}`, async () => {
        return await new Promise(async (resolve) => {
            const video = document.createElement("video");

            video.src = url;
            video.onloadedmetadata = () => resolve(video.videoHeight > 0 && video.videoWidth > 0);
            video.onerror = () => resolve(false);
        });
    })
}
const doesAudioExist = async (url) => {
    return await doesExistCache.get(`AUD_${url}`, async () => {
        return await new Promise(async (resolve) => {
            const audio = document.createElement("audio");

            audio.src = url;
            audio.onloadedmetadata = () => resolve(audio.duration > 0);
            audio.onerror = () => resolve(false);
        });
    })
}

function isInAndAboveViewport(element) {
    let rect = element.getBoundingClientRect();
    let html = document.documentElement;
    return (
        //rect.top >= 0 &&
        rect.left >= 0 &&
        rect.top <= (window.innerHeight || html.clientHeight) &&
        rect.right <= (window.innerWidth || html.clientWidth)
    );
}

const fixSizeScroll = (element) => {
    if (!isInAndAboveViewport(element))
        return;// return console.log("NOT SCROLLING: " + element.clientHeight);

    // make it scroll down by the element height
    // docChatUlDiv.scrollTop += element.clientHeight;
    // console.log("SCROLLING: " + element.clientHeight);
}

function checkIfUrlIsInTrusted(url) {
    if (!LocalSettings.autoLoadMediaFromTrustedUrls)
        return false;

    const arr = LocalSettings.trustedAutoLoadMediaUrls;
    for (let i = 0; i < arr.length; i++)
        if (url.startsWith(arr[i]))
            return true;
    return false;
}

function filterPartsOut(str, filterArr, replaceArr) {
    if (replaceArr == undefined) {
        replaceArr = [];
        for (let i = 0; i < filterArr.length; i++)
            replaceArr.push("");
    }

    while (true) {
        let changed = false;
        for (let i = 0; i < filterArr.length; i++) {
            let filter = filterArr[i];
            let replace = replaceArr[i];
            if (str.includes(filter)) {
                str = str.replaceAll(filter, replace);
                changed = true;
            }
        }

        if (!changed)
            break;
    }

    return str;
}

// Override function
const renderer = {
    image(token) {
        let url = token.href;
        let text = token.text;

        {
            if (LocalSettings.autoLoadMedia || window.location.href.includes("post_composer") || checkIfUrlIsInTrusted(url))// (settingsObj["chat"]["allow-external-sources-global"])
            {
                let randomId = getRandomIntInclusive(100000, 9999999);
                let element = document.createElement("a");
                element.href = url;
                element.target = "_blank";
                element.textContent = `[Image ${text}]`;
                element.id = `img-${randomId}`;
                // console.log("> Loading image: " + randomId);

                waitForElm(`#img-${randomId}`, async (element) => {
                    // console.log("> Found image: " + randomId, element);
                    if (await doesImageExist(url))
                    {
                        let node = await UrlElementCache.get(url, async () => {
                            let imgNode = document.createElement("img");
                            imgNode.src = url;
                            imgNode.alt = text;
                            imgNode.className = postStyles.chatImage;
                            imgNode.onload = () => fixSizeScroll(imgNode);
                            imgNode.onclick = () => {
                                // open image in new tab
                                let newTab = window.open(url, "_blank");
                                newTab.focus();
                            };
                            return imgNode;
                        });
                        // console.log("> REPLACING IMG WITH: ", node, element)
                        if (node.isConnected)
                            element.replaceWith(node.cloneNode(false));
                        else
                            element.replaceWith(node);
                    }
                    else if (await doesVideoExist(url))
                    {
                        let node = await UrlElementCache.get(url, async () => {
                            let videoNode= document.createElement("video");
                            videoNode.src = url;
                            videoNode.alt = text;
                            videoNode.className = postStyles.chatVideo;
                            videoNode.controls = true;
                            videoNode.onloadeddata = () => fixSizeScroll(videoNode);
                            return videoNode;
                        });
                        // console.log("> REPLACING VID WITH: ", node, element)
                        if (node.isConnected)
                            element.replaceWith(node.cloneNode(false));
                        else
                            element.replaceWith(node);
                    }
                    else if (await doesAudioExist(url))
                    {
                        let node = await UrlElementCache.get(url, async () => {
                            let audioNode= document.createElement("audio");
                            audioNode.src = url;
                            audioNode.alt = text;
                            audioNode.className = postStyles.chatAudio;
                            audioNode.controls = true;
                            audioNode.onloadeddata = () => fixSizeScroll(audioNode);
                            return audioNode;
                        });
                        // console.log("> REPLACING AUDIO WITH: ", node, element)
                        if (node.isConnected)
                            element.replaceWith(node.cloneNode(false));
                        else
                            element.replaceWith(node);
                    }
                    else
                    {
                        element.textContent = `[Unknown ${text}]`;
                    }
                });
                return `<a id="img-${randomId}">[Loading]</a>`;
            }
            else
            {
                text = text.replaceAll("<", "&lt;");
                text = text.replaceAll(">", "&gt;");

                url = url.replaceAll("<", "&lt;");
                url = url.replaceAll(">", "&gt;");

                return `<a href="${url}" target="_blank">[External: ${text} (${url})]</a>`;
            }
        }
    },

    link(token) {
        let url = token.href;
        let text = token.text;
        return `<a href="${url}" target="_blank">${text}</a>`;
    },

    code(token) {
        let codeRes = token.text;
        let lang = token.lang;
        if (lang)
        {
            // console.log("Highlighting code with language: " + lang);
            try {
                let code = hljs.highlight(codeRes, {language:lang, ignoreIllegals:true});
                // console.log("> RES: ", code);
                codeRes = code.value;
            } catch (e) {
                console.error(e);
            }
        }
        else
            codeRes = codeRes.replaceAll("\n", "<br>");

        return `<code class="${postStyles.code} ${postStyles.codeBlock}">${codeRes}</code>`;
    },

    codespan(token) {
        let text = token.text;
        return `<code class="${postStyles.code} ${postStyles.codeSpan}">${text}</code>`;
    },

    html(token) {
        let text = token.text;

        /*
        <style= "border:1px solid red;">
            asdf jklö
            asdf
        </style>
        */
        if (text.startsWith("<style \"") && text.replaceAll("\n", "").endsWith("</style>")) {
            // extract the style info in the ""
            const first = text.indexOf('"');
            const last = text.indexOf('">');
            if (first === -1 || last === -1)
                return text;

            // console.log("Text: ", text, first, last);
            const style = text.substring(first + 1, last);
            const styleEnd = text.lastIndexOf("</style>");
            // console.log("Style: ", style, styleEnd, text.substring(last + 2, styleEnd));

            // Get the text inside the style block and escape it
            const inbetween = text.substring(last + 2, styleEnd)
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', '&quot;')
                .replaceAll("'", "&apos;");
            // console.log("Inbetween: ", inbetween);

            // Custom Styles disabled
            if (!LocalSettings.enabledCustomPostCss && window.location.href.includes("post_composer"))
                return `<div style="isolation: isolate !important;position: inherit !important;">${inbetween}</div>`;

            // Parsing the style data and un-escaping goofy things like using &#47; because css does accept that
            let resStyle = "";
            try {
                const doc = new DOMParser().parseFromString(style, "text/html");
                resStyle = doc.documentElement.textContent;
            } catch (e) {
                console.info("Error parsing style data:", e);
                return `<div style="isolation: isolate !important;position: inherit !important;">${inbetween}</div>`;
            }
            // console.log("Res Style: ", resStyle);

            // Escaping custom styles
            const escapedStyle = resStyle
                .toLowerCase()
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll('"', '&quot;')
                .replaceAll("'", "&apos;")
                .replaceAll("\\", "");
            // console.log("Escaped Style: ", escapedStyle);

            // Filtering some annoying properties
            const styleBaseFilter = ["position", "url", "src", "data:", "expression", "//"];
            const styleAnimationFilter = ["animation", "transition", "keyframes"];
            const styleFilter = (!LocalSettings.enabledCustomPostAnimations && !window.location.href.includes("post_composer")) ?
                styleBaseFilter.concat(styleAnimationFilter) : styleBaseFilter;
            const filteredStyle = filterPartsOut(escapedStyle, styleFilter);

            // Recursive parsing of inside elements
            let inbetweenHtml = inbetween;
            try {
                const dirty = marked.parse(text.substring(last + 2, styleEnd));
                // console.log(dirty);
                const clean = DOMPurify.sanitize(dirty, { ADD_ATTR: ['target'] });
                // console.log(clean);
                inbetweenHtml = clean;
            } catch (e) {
                console.warn("ERROR RENDERING INNER HTML: ", e)
            }
            // console.log("Inbetween HTML: ", inbetweenHtml);

            return `<div style="${filteredStyle};*/;position: inherit !important;">${inbetweenHtml}</div>`;
        } else {
            const text2 = text
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll("\n", "<br>");

            return text2;
        }
    },

    text(token) {
        let parts = token.text.split(" ");
        let partRes = [];
        for (let part of parts)
        {
            if (part.startsWith("@") && part.length > 1)
            {
                let ping = part.substring(1);
                let randomInt = getRandomIntInclusive(100000, 9999999);
                let pingId = `chat-ping-${randomInt}-user-${ping}`;
                waitForElm(`#${pingId}`, async (element) => {
                    const publicKey = await getPublicKeyFromUserId(ping);
                    if (publicKey == undefined) {
                        element.textContent = `@Unknown User`;
                        element.className = postStyles.pingUnknown;
                        return;
                    }

                    const linkElement = document.createElement("a");
                    linkElement.textContent = `@${ping}`;
                    linkElement.className = (ping == GlobalStuff.userId) ? postStyles.pingSelf : postStyles.pingOther;
                    linkElement.href = `${basePath}/user/profile?userId=${encodeURIComponent(ping)}&serverId=${encodeURIComponent(GlobalStuff.server)}`;
                    linkElement.target = "_blank";
                    element.replaceWith(linkElement);
                });
                partRes.push(`<span id="${pingId}">${part}</span>`);
            }
            else
                partRes.push(part);
        }
        return partRes.join(" ");
    }
};

export default {useNewRenderer: true, renderer, breaks: true };
'use client';
import hljs from "@/lib/highlight/highlight";
import {getRandomIntInclusive} from "@/lib/cryptoUtils";
import {LocalSettings} from "@/lib/localSettings";

let idSet = new Set();

function waitForElm(selector, func) {
    if (idSet.has(selector))
        return;
    idSet.add(selector);
    // console.log("> Waiting for element: ", selector, idSet);

    const observer = new MutationObserver(mutations => {
        setTimeout(() => {
            if (document.querySelector(selector)) {
                // console.log("> Found element: ", selector);
                // observer.disconnect();
                // resolve(document.querySelector(selector));
                const elem = document.querySelector(selector);
                elem.id = `done-${elem.id}`;
                func(elem);
            }
        }, 50);
        // if (document.querySelector(selector)) {
        //     console.log("> Found element: ", selector);
        //     observer.disconnect();
        //     func(document.querySelector(selector));
        // }
    });

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

const doesImageExist = (url) =>
    new Promise((resolve) => {
        const img = new Image();

        img.src = url;
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
    });

const doesVideoExist = (url) =>
    new Promise((resolve) => {
        const video = document.createElement("video");

        video.src = url;
        video.onloadedmetadata = () => resolve(video.videoHeight > 0 && video.videoWidth > 0);
        video.onerror = () => resolve(false);
    });

const doesAudioExist = (url) =>
    new Promise((resolve) => {
        const audio = document.createElement("audio");

        audio.src = url;
        audio.onloadedmetadata = () => resolve(audio.duration > 0);
        audio.onerror = () => resolve(false);
    });

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

// Override function
const renderer = {
    image(token) {
        let url = token.href;
        let text = token.text;

        {
            if (LocalSettings.autoLoadMedia)// (settingsObj["chat"]["allow-external-sources-global"])
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
                        let imgNode = document.createElement("img");
                        imgNode.src = url;
                        imgNode.alt = text;
                        imgNode.className = "chat-image";
                        imgNode.onload = () => fixSizeScroll(imgNode);
                        element.replaceWith(imgNode);

                        imgNode.onclick = () => {
                            // open image in new tab
                            let newTab = window.open(url, "_blank");
                            newTab.focus();
                        };
                    }
                    else if (await doesVideoExist(url))
                    {
                        let videoNode = document.createElement("video");
                        videoNode.src = url;
                        videoNode.alt = text;
                        videoNode.className = "chat-video";
                        videoNode.controls = true;
                        videoNode.onloadeddata = () => fixSizeScroll(videoNode);
                        element.replaceWith(videoNode);
                    }
                    else if (await doesAudioExist(url))
                    {
                        let audioNode = document.createElement("audio");
                        audioNode.src = url;
                        audioNode.alt = text;
                        audioNode.className = "chat-audio";
                        audioNode.controls = true;
                        audioNode.onloadeddata = () => fixSizeScroll(audioNode);
                        element.replaceWith(audioNode);
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

        return `<code class="code code-block">${codeRes}</code>`;
    },

    codespan(token) {
        let text = token.text;
        return `<code class="code code-span">${text}</code>`;
    },

    html(token) {
        let text = token.text;
        text = text.replaceAll("<", "&lt;");
        text = text.replaceAll(">", "&gt;");
        text = text.replaceAll("\n", "<br>");
        return text;
    },

    text(token) {
        let parts = token.text.split(" ");
        let partRes = [];
        for (let part of parts)
        {
            // if (part.startsWith("@") && part.length > 1)
            // {
            //     let ping = part.substring(1);
            //     let randomInt = getRandomIntInclusive(100000, 9999999);
            //     let pingId = `chat-ping-${randomInt}-user-${ping}`;
            //     waitForElm(`#${pingId}`).then(async (element) => {
            //         let userId = parseInt(ping);
            //         if (!userExists(userId) && userId != currentUser['mainAccount']['userId'])
            //         {
            //             element.className = "chat-ping chat-ping-other";
            //             return element.textContent = `@[Unknown User]`;
            //         }
            //
            //         let username = userGetInfoDisplayUsernameShort(currentUser['mainAccount'], userId);
            //         element.textContent = `@${username}`;
            //         if (userId == currentUser['mainAccount']['userId'])
            //             element.className = "chat-ping chat-ping-self";
            //         else
            //             element.className = "chat-ping chat-ping-other";
            //
            //         element.onclick = () => {
            //             //openChat(userId);
            //         };
            //     });
            //     partRes.push(`<span id="${pingId}">${part}</span>`);
            // }
            // else
                partRes.push(part);
        }
        return partRes.join(" ");
    }
};

export default {useNewRenderer: true, renderer, breaks: true };
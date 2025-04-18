'use client';

import marked from "@/lib/marked"
import MarkedExtension from "@/lib/markedExtension";
import DOMPurify from "@/lib/purify";
import "@/lib/highlight/styles/github-dark.min.css";
import "@/app/user/home/entries/postCss.module.css";
import {convertTextWithEmojis} from "@/lib/emoji/emojiUtils";

let markedUsed = false;

export function getPostHtml(text)
{
    if (!markedUsed) {
        marked.use(MarkedExtension);
        markedUsed = true;
    }

    if (typeof DOMPurify == "undefined")
        return;

    try {
        const dirty = marked.parse(text);

        const emoji = convertTextWithEmojis(dirty);

        // console.log(dirty);
        const clean = DOMPurify.sanitize(emoji, { ADD_ATTR: ['target'] });
        // console.log(clean);
        return clean;
    } catch (e) {
        console.warn("ERROR RENDERING: ", e)
    }
}
'use client';

import marked from "@/lib/marked"
import MarkedExtension from "@/lib/markedExtension";
import DOMPurify from "@/lib/purify";
import "@/lib/highlight/styles/github-dark.min.css";
import "@/app/user/home/entries/postCss.module.css";

let markedUsed = false;

export function getPostHtml(text)
{
    if (!markedUsed) {
        marked.use(MarkedExtension);
        markedUsed = true;
    }

    try {
        const dirty = marked.parse(text);
        // console.log(dirty);
        const clean = DOMPurify.sanitize(dirty, { ADD_ATTR: ['target'] });
        // console.log(clean);
        return clean;
    } catch (e) {
        console.warn("ERROR RENDERING: ", message)
    }
}
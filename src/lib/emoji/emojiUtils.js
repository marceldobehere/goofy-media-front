'use client';

import EmojiConvertor from "./emoji";

export function convertTextWithEmojis(input) {
    const emoji = new EmojiConvertor();
    const output1 = emoji.replace_unified(input);

    // const res = emoji.replace_colons(input);

    emoji.replace_mode = 'unified';
    emoji.allow_native = true;
    const res = emoji.replace_colons(input);

    return res;
}
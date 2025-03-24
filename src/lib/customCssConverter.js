'use client';

import postEntryStyles from "@/app/user/home/entries/postEntry.module.css";
import postBodyStyles  from "@/app/user/home/entries/postCss.module.css";
import homeStyles from "@/app/user/home/page.module.css";

const supportedComponents = {
    "Posts": {
        "PostHeader": postEntryStyles.PostEntryHeader,
        "PostUserHeader": postEntryStyles.PostUserHeader,
        "PostBody": postEntryStyles.PostBody,
    },
    "PostContent": {
        "PostBodyImage": postBodyStyles.chatImage,
        "PostBodyAudio": postBodyStyles.chatAudio,
        "PostBodyVideo": postBodyStyles.chatVideo,
        "PostCode": postBodyStyles.code,
        "PostCodeBlock": postBodyStyles.codeBlock,
        "PostCodeSpan": postBodyStyles.codeSpan,
    },
    "Home": {
        "HomeNavBar": homeStyles.NavBarDiv,
        "HomePostDiv": homeStyles.PostDiv,
        "HomeNewsDiv": homeStyles.NewsDiv,
    }
};
function getAllAvailableClasses(data) {
    if (data == undefined)
        data = supportedComponents;

    let allClasses = [];
    for (let key in data) {
        let obj = data[key];
        if (typeof obj === "object")
            allClasses.push(...getAllAvailableClasses(obj));
        else
            allClasses.push({key: key, value: obj});
    }
    return allClasses;
}

export function getAllAvailableClassNames() {
    let allClasses = getAllAvailableClasses();
    return allClasses.map(x => x.key);
}

export function convertCssString(input) {
    const allClasses = getAllAvailableClasses();
    let output = input;
    for (let {key, value} of allClasses) {
        output = output.replaceAll("#" + key + "{", "#" + value + "{");
        output = output.replaceAll("." + key + "{", "." + value + "{");
        output = output.replaceAll("#" + key + " ", "#" + value + " ");
        output = output.replaceAll("." + key + " ", "." + value + " ");
    }
    return output;
}
'use client';

import styles from "@/app/user/home/entries/postEntry.module.css";
import {basePath, goPath} from "@/lib/goPath";
import {useEffect, useState} from "react";
import {getRandomIntInclusive} from "@/lib/cryptoUtils";
import Link from "next/link";
import {GlobalStuff} from "@/lib/globalStateStuff";

const loadGetPostHtml = async () => {
    return (await import("@/app/user/home/entries/postProcess.js")).getPostHtml;
}

export default function PostEntry({post}) {
    const [innerHTML, setInnerHTML] = useState();
    const [lastPostText, setLastPostText] = useState();
    const [isValid, setIsValid] = useState();

    if (lastPostText !== post.text) {
        setLastPostText(post.text);
        loadGetPostHtml().then((getPostHtml) => {
            setInnerHTML(getPostHtml(post.text));
        });

        setIsValid(undefined);
        if (post.valid)
            post.valid().then((res) => {
                setIsValid(res);
            })
    }

    // useEffect(() => {
    //     loadGetPostHtml().then((getPostHtml) => {
    //         setInnerHTML(getPostHtml(post.text));
    //     });
    // }, []);

    const validStuff = [
        {emoji: "❌", title: `Error: ${isValid ? isValid.error : ""}`},
        {emoji: "✅", title: "Post is valid"},
        {emoji: "?", title: "Post is being validated..."}
    ];
    const validChoice = validStuff[isValid ? (isValid.ok ? 1 : 0) : 2];

    return (
        <div className={styles.PostEntryDiv} style={{position: "relative"}}>
            <div className={styles.PostUserHeader}>
                <b>{post.displayName}</b> <a style={{textDecoration: "none"}}
                                             href={`${basePath}/user/profile?userId=${encodeURIComponent(post.author)}`}>@{post.author}</a> - {new Date(post.createdAt).toLocaleString()}
            </div>

            <h3 className={styles.PostEntryHeader}><a style={{textDecoration: "none"}} href={`${basePath}/user/post?uuid=${encodeURIComponent(post.uuid)}&serverId=${encodeURIComponent(GlobalStuff.server)}`} target={"_blank"}>{post.title}</a></h3>

            {innerHTML !== undefined ?
                <p className={styles.PostBody} dangerouslySetInnerHTML={{__html: innerHTML}}></p> :
                <p className={styles.PostBody}>{post.text}</p>}

            <div style={{display: "inline", position:"absolute", bottom:"5px", right:"5px"}} title={validChoice.title}>{validChoice.emoji}</div>

            <p className={styles.PostTags}>Tags: {post.tags.map((tag, idx) => (
                <span key={idx}><a
                    href={`${basePath}/guest/search?tag=${encodeURIComponent(tag)}`}>#{tag}</a>&#32;</span>))}</p>
        </div>
    );
}
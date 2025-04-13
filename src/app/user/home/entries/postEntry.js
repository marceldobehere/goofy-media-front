'use client';

import styles from "@/app/user/home/entries/postEntry.module.css";
import {basePath, goPath} from "@/lib/goPath";
import {useEffect, useState} from "react";
import {getRandomIntInclusive} from "@/lib/cryptoUtils";
import Link from "next/link";
import {GlobalStuff} from "@/lib/globalStateStuff";
import {LocalSettings} from "@/lib/localSettings";
import {isPostLiked, likePost, unlikePost} from "@/lib/likes/likeUtils";
import {CoolCache} from "@/lib/coolCache";

const loadGetPostHtml = async () => {
    return (await import("@/app/user/home/entries/postProcess.js")).getPostHtml;
}

const likedPostCache = new CoolCache({localStorageKey: "IS_POST_LIKED", maxSize: 2000, saveToLocalStorageFreq: 1, cacheEntryTimeout: 1000*60*30});

export default function PostEntry({post}) {
    const [innerHTML, setInnerHTML] = useState();
    const [lastPostText, setLastPostText] = useState();
    const [isValid, setIsValid] = useState();
    const [isLiked, setIsLiked] = useState();

    const openInNewTab = LocalSettings.openPostInNewTab;

    async function checkLikedStatus() {
        const res = await likedPostCache.get(post.uuid, async () => {
            const res = await isPostLiked(post.uuid);
            return res;
        });
        if (res !== undefined) {
            setIsLiked(res);
            return;
        }
    }

    if (lastPostText !== post.text) {
        setLastPostText(post.text);
        setIsValid(undefined);

        setTimeout(() => {
            loadGetPostHtml().then((getPostHtml) => {
                setInnerHTML(getPostHtml(post.text));
            });

            if (post.valid)
                post.valid().then((res) => {
                    setIsValid(res);
                })

            if (post.likeOverride == undefined && GlobalStuff.loggedIn) {
                checkLikedStatus();
            }
        }, getRandomIntInclusive(50, 250))
    }

    async function toggleLike() {
        if (isLiked == undefined)
            return;

        await likedPostCache.delete(post.uuid);
        if (isLiked) {
            const res = await unlikePost(post.uuid);
            if (!res)
                alert("Failed to unlike post");
        } else {
            const res = await likePost(post.uuid);
            if (!res)
                alert("Failed to like post");
        }
        await checkLikedStatus();
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
                                             href={`${basePath}/user/profile?userId=${encodeURIComponent(post.author)}&serverId=${encodeURIComponent(GlobalStuff.server)}`}>@{post.author}</a> - {new Date(post.createdAt).toLocaleString()}
            </div>

            <h3 className={styles.PostEntryHeader}><a style={{textDecoration: "none"}}
                                                      href={`${basePath}/user/post?uuid=${encodeURIComponent(post.uuid)}&serverId=${encodeURIComponent(GlobalStuff.server)}`}
                                                      target={openInNewTab ? "_blank" : ""}>{post.title}</a></h3>

            <div className={"post-click-div-thing"} onClick={(event) => {
                if (event.target == undefined || event.target.tagName == undefined || !LocalSettings.extendPostClickHitbox)
                    return;
                const tagName = event.target.tagName.toLowerCase();
                if (["a", "img", "video", "audio", "input"].includes(tagName))
                    return console.info("> Ignoring Click on: " + tagName);

                goPath(`/user/post?uuid=${encodeURIComponent(post.uuid)}&serverId=${encodeURIComponent(GlobalStuff.server)}`, openInNewTab);
                event.preventDefault();
            }}>
                {innerHTML !== undefined ?
                    <p className={styles.PostBody} dangerouslySetInnerHTML={{__html: innerHTML}}></p> :
                    <p className={styles.PostBody}>{post.text}</p>}
            </div>


            <hr style={{marginBottom: "10px"}}/>
            <div style={{display: "inline", position: "absolute", bottom: "5px", right: "5px"}}
                 title={validChoice.title}>{validChoice.emoji}</div>
            <p className={styles.PostTags}>Tags: {post.tags.map((tag, idx) => (
                <span key={idx}><a
                    href={`${basePath}/guest/search?tag=${encodeURIComponent(tag)}`}>#{tag}</a>&#32;</span>))}</p>

            <a style={{textDecoration: "none"}}
               href={`${basePath}/user/post?uuid=${encodeURIComponent(post.uuid)}&serverId=${encodeURIComponent(GlobalStuff.server)}&scrollToComments=true`}
               target={openInNewTab ? "_blank" : ""}>{post.commentCount} Comment{(post.commentCount == 1) ? "" : "s"}</a>
            <span>&nbsp; - &nbsp;</span>
            <button disabled={isLiked == undefined} onClick={toggleLike}>{isLiked ? "Unlike" : "Like"}
            </button>
        </div>
    );
}
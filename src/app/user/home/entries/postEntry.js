'use client';

import styles from "@/app/user/home/entries/postEntry.module.css";
import {basePath, goPath} from "@/lib/goPath";
import {useEffect, useState} from "react";
import {getRandomIntInclusive} from "@/lib/cryptoUtils";
import {GlobalStuff, useGlobalState} from "@/lib/globalStateStuff";
import {LocalSettings} from "@/lib/localSettings";
import {isPostLiked, likePost, unlikePost} from "@/lib/likes/likeUtils";
import {CoolCache} from "@/lib/coolCache";
import {usePathname} from "next/navigation";

const loadGetPostHtml = async () => {
    return (await import("@/app/user/home/entries/postProcess.js")).getPostHtml;
}

const likedPostCache = new CoolCache({
    localStorageKey: "IS_POST_LIKED",
    maxSize: 2000,
    saveToLocalStorageFreq: 1,
    cacheEntryTimeout: 1000 * 60 * 60 * 24 * 5 // 5 days
});

export default function PostEntry({post}) {
    const pathName = usePathname();
    const [innerHTML, setInnerHTML] = useState();
    const [isValid, setIsValid] = useState();
    const [isLiked, setIsLiked] = useState();
    const [displayName, setDisplayName] = useState();

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

    useEffect(() => {
        if (typeof window == "undefined")
            return;

        if (window.location.href.includes("post_composer"))
            loadGetPostHtml().then((getPostHtml) => {
                setInnerHTML(getPostHtml(post.text));
            });
        else
            setTimeout(() => {
                loadGetPostHtml().then((getPostHtml) => {
                    setInnerHTML(getPostHtml(post.text));
                });
            }, getRandomIntInclusive(50, 250))
    }, [post]);

    useGlobalState(pathName, false, false, () => {
        if (post.likeOverride == undefined && GlobalStuff.loggedIn) {
            setTimeout(checkLikedStatus, getRandomIntInclusive(50, 250));
        }
    }, () => {
        if (post.valid)
            post.valid().then((res) => {
                setIsValid(res);
            })
        if (post.displayName)
            post.displayName().then((res) => {
                setDisplayName(res);
            });
    });

    useEffect(() => {
        if (post.likeOverride)
            if (post.displayName)
                post.displayName().then((res) => {
                    setDisplayName(res);
                });
    }, [post]);


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

    const validStuff = [
        {emoji: "❌", title: `Error: ${isValid ? isValid.error : ""}`},
        {emoji: "✅", title: "Post is valid"},
        {emoji: "?", title: "Post is being validated..."}
    ];
    const validChoice = validStuff[isValid ? (isValid.ok ? 1 : 0) : 2];

    return (
        <div className={styles.PostEntryDiv} style={{position: "relative"}}>
            <div className={styles.PostUserHeader}>
                <b>{displayName ? displayName : "?"}</b> <a style={{textDecoration: "none"}}
                                             href={`${basePath}/user/profile?userId=${encodeURIComponent(post.author)}&serverId=${encodeURIComponent(GlobalStuff.server)}`}>@{post.author}</a> - {new Date(post.createdAt).toLocaleString()}
            </div>
            <hr/>

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
                    <p className={styles.PostBody} style={{isolation: "isolate"}} dangerouslySetInnerHTML={{__html: innerHTML}}></p> :
                    <p className={styles.PostBody}>{post.text}</p>}
            </div>


            <div style={{display: "inline", position: "absolute", bottom: "0.7rem", right: "0.5rem"}}
                 title={validChoice.title}>{validChoice.emoji}</div>

            <p className={styles.PostTags}>{(post.tags.length == 0) ? "No tags" : ""}{post.tags.map((tag, idx) => (
                <span key={idx}><a
                    href={`${basePath}/guest/search?tag=${encodeURIComponent(tag)}`}>#{tag}</a></span>))}</p>

            <hr/>
            <div className={styles.PostEntryFooter}>
                <a style={{textDecoration: "none"}}
                   href={`${basePath}/user/post?uuid=${encodeURIComponent(post.uuid)}&serverId=${encodeURIComponent(GlobalStuff.server)}&scrollToComments=true`}
                   target={openInNewTab ? "_blank" : ""}>{post.commentCount} Comment{(post.commentCount == 1) ? "" : "s"}</a>
                <span>&nbsp; - &nbsp;</span>
                <button disabled={isLiked == undefined} onClick={toggleLike}>{isLiked ? "Unlike" : "Like"}
                </button>
            </div>
        </div>
    );
}
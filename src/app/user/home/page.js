'use client';

import styles from "./page.module.css";
import postStyles from "@/app/user/home/entries/postEntry.module.css";
import {GlobalStuff, initGlobalState, logout, useGlobalState} from "@/lib/globalStateStuff";
import {useState} from "react";
import Link from "next/link";
import {basePath, goPath} from "@/lib/goPath";
import {usePathname} from "next/navigation";
import PostEntry from "@/app/user/home/entries/postEntry";
import NewsEntry from "@/app/user/home/entries/newsEntry";
import EntryList from "@/app/user/home/entries/EntryList";
import {sleep} from "@/lib/utils";
import Image from "next/image";
import {
    loadGlobalPosts,
    loadHomeNewsPosts,
    loadHomePosts,
    loadMorePostsPartially
} from "@/lib/post/postUtils";
import {LocalSettings, saveLocalSettingsKey} from "@/lib/localSettings";
import UnifiedMenu from "@/comp/unified_layout/unifiedMenu";

export default function Home() {
    const pathName = usePathname();
    let [postArr, setPostArr] = useState([]);
    let [newsArr, setNewsArr] = useState([]);
    let [username, setUsername] = useState("...");
    let [overrideShowGlobalPosts, setOverrideShowGlobalPosts] = useState(false);

    async function loadPosts() {
        if (GlobalStuff.loggedIn && !overrideShowGlobalPosts) {
            const res = await loadHomePosts();
            if (res === undefined)
                return alert("Failed to get posts");
            setPostArr(res);
        } else {
            const res = await loadGlobalPosts();
            if (res === undefined)
                return alert("Failed to get posts");
            setPostArr(res);
        }
    }
    async function loadNews() {
        const res = await loadHomeNewsPosts(10);
        if (res === undefined)
            return alert("Failed to get posts");
        setNewsArr(res);
    }

    let morePostBusy = false;
    async function loadMorePosts() {
        if (morePostBusy)
            return;
        morePostBusy = true;

        const res = (GlobalStuff.loggedIn && !overrideShowGlobalPosts) ?
            (await loadMorePostsPartially(postArr, "/user/post/following", 10)) :
            (await loadMorePostsPartially(postArr, "/user/post", 10));
        if (res === undefined) {
            await sleep(200);
            morePostBusy = false;
            return;
        }

        const changed = res.length !== postArr.length;
        if (changed)
            setPostArr(res);

        await sleep(200);
        morePostBusy = false;
    }

    let prevPos = undefined;
    async function onPostScroll() {
        let btn = document.getElementById("load-more-posts-btn");
        if (btn === null)
            return console.info("NO LONGER EXISTS");

        const pos = btn.getBoundingClientRect().top;
        // Ignore if scrolling up
        if (prevPos == undefined)
            prevPos = pos;
        if (pos >= prevPos) {
            prevPos = pos;
            return;
        }
        prevPos = pos;

        // check if button is visible on screen
        if (pos < window.innerHeight + 900 && pos > window.innerHeight - 180) {
            loadMorePosts();
        }
    }

    async function overrideGlobalToggle() {
        if (!GlobalStuff.loggedIn)
            return;

        const newVal = !overrideShowGlobalPosts;
        await saveLocalSettingsKey("overrideShowGlobalFeed", newVal);
        overrideShowGlobalPosts = newVal;
        setOverrideShowGlobalPosts(newVal);
        loadPosts();
    }

    if (typeof  window !== "undefined")
        window.onscroll = onPostScroll;
    useGlobalState(pathName, false, false, async () => {
        setOverrideShowGlobalPosts(LocalSettings.overrideShowGlobalFeed);
        overrideShowGlobalPosts = LocalSettings.overrideShowGlobalFeed;
        if (GlobalStuff.loggedIn) {
            setUsername(GlobalStuff.userId);
        } else {
            setUsername("Guest");
        }

        loadPosts();
        loadNews();
    });

    return <>
        <Image style={{
            position: "fixed",
            bottom: "5rem",
            right: "3rem",
            width: "3rem",
            height: "3rem",
            backgroundColor: "rgba(0,0,0,0.7)",
            borderRadius: "50%",
            cursor: "pointer",
            display: "block",
            zIndex: 100
        }} src={"/goofy-media-front/write_icon.png"} alt={"Write Icon"} width={"100"} height={"100"}
               onClick={() => {
                   goPath("/user/post_composer")
               }}></Image>

        <UnifiedMenu
            mainDivData={
                <div className={styles.PostDiv}>
                    <h2>{(GlobalStuff.loggedIn) ? (<span>Hi, <a
                        href={`${basePath}/user/profile?userId=${encodeURIComponent(username)}&serverId=${encodeURIComponent(GlobalStuff.server)}`}
                        target={"_blank"}
                        style={{textDecoration: "none"}}>@{username}</a></span>) : "Hi, Guest"}</h2>

                    Cool Posts below: &nbsp;
                    <button onClick={loadPosts}>Refresh</button>
                    &nbsp;
                    {(GlobalStuff.loggedIn) ? <button
                        onClick={overrideGlobalToggle}>{overrideShowGlobalPosts ? "Global Feed" : "Your Feed"}</button> : <></>}
                    <EntryList elements={postArr} compFn={(post) => (<PostEntry post={post}></PostEntry>)}
                               keyFn={(post) => (post.uuid)}
                               extra={
                                   <div
                                       className={postStyles.PostEntryDiv}>
                                       {(postArr.length > 0) ?
                                           <button id={"load-more-posts-btn"} className={"cont-btn"}
                                                   onClick={loadMorePosts}>Load
                                               More Posts
                                           </button> :
                                           <div style={{padding: "1rem"}}>
                                               <h3>No Posts :(</h3>
                                               {GlobalStuff.loggedIn ? <>
                                                   <br/>
                                                   <p>Seems like you aren't following anyone or no-one you are
                                                       following has posted anything :(<br/>
                                                       Try finding some posts in the search or take a look at
                                                       the <Link href={"/guest/search?tag=global"}>global
                                                           feed</Link>.</p>
                                               </> : <></>}
                                           </div>}
                                   </div>
                               }>
                    </EntryList>
                </div>
            }

            rightDivData={
                <div id={"goofy-posts"} onScroll={onPostScroll}>
                    <div className={styles.NewsDiv}>
                        <h2>Goofy Media News</h2>

                        Cool <Link href={"/guest/news"}>News</Link> below: &nbsp;
                        <button onClick={loadNews}>Refresh</button>
                        <EntryList elements={newsArr}
                                   compFn={(post) => (<NewsEntry post={post}></NewsEntry>)}
                                   keyFn={(post) => (post.uuid)}></EntryList>
                    </div>
                </div>
            }
        />
    </>;
}

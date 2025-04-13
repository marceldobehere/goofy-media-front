'use client';

import styles from "./page.module.css";
import postStyles from "@/app/user/home/entries/postEntry.module.css";
import {GlobalStuff, initGlobalState, logout} from "@/lib/globalStateStuff";
import {useEffect, useState} from "react";
import MainFooter from "@/comp/mainFooter";
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
import {getUnreadNotificationCount} from "@/lib/notifications/notificationUtils";

export default function Home() {
    const pathName = usePathname();
    let [showBurgerMenu, setBurger] = useState(false);
    let [postArr, setPostArr] = useState([]);
    let [newsArr, setNewsArr] = useState([]);
    let [username, setUsername] = useState("...");
    let [admin, setAdmin] = useState(false);
    let [notifCount, setNotifCount] = useState();

    async function loadPosts() {
        if (GlobalStuff.loggedIn) {
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

    let morePostBusy = false;

    async function loadMorePosts() {
        // console.log("> Loading more posts");
        if (morePostBusy)
            return;
        morePostBusy = true;

        const res = (GlobalStuff.loggedIn) ? (await loadMorePostsPartially(postArr, "/user/post/following", 10)) : (await loadMorePostsPartially(postArr, "/user/post", 10));
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

    async function loadNotifs() {
        if (!GlobalStuff.loggedIn)
            return setNotifCount(0);
        const notifCount = await getUnreadNotificationCount();
        if (notifCount === undefined)
            return alert("Failed to get notifications");
        setNotifCount(notifCount);
    }

    async function loadNews() {
        const res = await loadHomeNewsPosts(10);
        if (res === undefined)
            return alert("Failed to get posts");
        setNewsArr(res);
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
        if (pos < window.innerHeight + 450 && pos > window.innerHeight - 180) {
            loadMorePosts();
        }
    }

    useEffect(() => {
        initGlobalState(pathName, false, false, async () => {
            // if (!GlobalStuff.loggedIn)
            //     goPath("/guest/login");

            if (GlobalStuff.loggedIn) {
                setUsername(GlobalStuff.userId);
                setAdmin(GlobalStuff.admin);
            } else {
                setUsername("Guest");
                setAdmin(false);
            }

            const nav = document.getElementById("goofy-nav");
            const posts = document.getElementById("goofy-posts");
            nav.addEventListener('wheel', (e) => {
                if (e.deltaY > 0) {
                    posts.scrollBy(0, 100);
                } else {
                    posts.scrollBy(0, -100);
                }
            });

            loadPosts();
            loadNews();
            loadNotifs();
        });

        window.onresize = () => {
            if (showBurgerMenu && (window.getComputedStyle(document.documentElement).getPropertyValue('--show_hamburg') === '0')) {
                setBurger(false);
            }
        }
    })

    return (
        <div>
            <main className={styles.main}>

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

                <nav id={"goofy-nav"} className={showBurgerMenu ? styles.NavBar2 : styles.NavBar}>
                    <div className={styles.NavBarHamburg}>
                        <button onClick={() => {
                            setBurger(!showBurgerMenu);
                        }}>{showBurgerMenu ? "^" : "v"}</button>
                        <h2><a href={"#top"} style={{textDecoration: "none"}}>Goofy Media</a></h2>
                    </div>
                    <div className={showBurgerMenu ? styles.None : styles.NavBarDiv}>
                        {showBurgerMenu ? <></> : <h2>Navigation</h2>}
                        <p>
                            {admin ? (<><Link href={"/admin/dashboard"}>Admin Dashboard</Link><br/></>) : (<></>)}
                            <Link href={"/user/home"}>Home</Link><br/>
                            {(GlobalStuff.loggedIn) ? (<>
                                <a onClick={async () => {
                                    await logout();
                                    goPath("/guest/login")
                                }}>Logout</a><br/>
                            </>) : (<>
                                <a onClick={async () => {
                                    goPath("/guest/login")
                                }}>Login</a><br/>
                            </>)}
                            <Link href={"/guest/news"}>News</Link><br/>
                            <Link href={"/guest/search"}>Search</Link><br/>
                            <Link href={"/guest/search?tag=global"}>Global Feed</Link><br/>
                            {(GlobalStuff.loggedIn) ? <>
                                <Link href={"/user/notifications"}>Notifications {((notifCount == undefined || notifCount == 0) ? "" : `(${notifCount})`)}</Link><br/>
                            </> : ""}
                            {(GlobalStuff.loggedIn) ? <><Link href={"/user/following"}>Following</Link><br/></> : ""}
                            {(GlobalStuff.loggedIn) ? <><Link href={"/user/followers"}>Followers</Link><br/></> : ""}
                            {(GlobalStuff.loggedIn) ? <><Link href={"/user/liked_posts"}>Liked Posts</Link><br/></> : ""}
                            <Link href={"/user/account_settings"}>Account Settings</Link><br/>
                            {(GlobalStuff.loggedIn) ? <><Link href={"/user/post_composer"}>Post Composer</Link><br/></> : ""}
                        </p>
                    </div>
                </nav>

                <div id={"goofy-posts"} className={styles.MainContent} onScroll={onPostScroll}>
                    <div className={styles.PostDiv}>
                        <h2 id={"top"}>{(GlobalStuff.loggedIn) ? (<span>Hi, <a href={`${basePath}/user/profile?userId=${encodeURIComponent(username)}&serverId=${encodeURIComponent(GlobalStuff.server)}`} target={"_blank"} style={{textDecoration: "none"}}>@{username}</a></span>) : "Hi, Guest"}</h2>

                        Cool Posts below: &nbsp;
                        <button onClick={loadPosts}>Refresh</button>
                        <EntryList elements={postArr} compFn={(post) => (<PostEntry post={post}></PostEntry>)} keyFn={(post) => (post.uuid)}
                                   extra={
                                       <div
                                           className={postStyles.PostEntryDiv}>
                                           {(postArr.length > 0) ?
                                               <button id={"load-more-posts-btn"} className={"cont-btn"}
                                                       onClick={loadMorePosts}>Load
                                                   More Posts
                                               </button> :
                                               <div>
                                                   <h3>No Posts :(</h3>
                                                   <p>Seems like you aren't following anyone or no-one you are following has posted anything :(<br/>
                                                   Try finding some posts in the search or take a look at the <Link href={"/guest/search?tag=global"}>global feed</Link>.</p>
                                               </div>}
                                       </div>
                                   }></EntryList>
                    </div>

                    <div className={styles.NewsDiv}>
                        <h2>Goofy Media News</h2>

                        Cool <Link href={"/guest/news"}>News</Link> below: &nbsp;
                        <button onClick={loadNews}>Refresh</button>
                        <EntryList elements={newsArr}
                                   compFn={(post) => (<NewsEntry post={post}></NewsEntry>)} keyFn={(post) => (post.uuid)}></EntryList>
                    </div>
                </div>
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

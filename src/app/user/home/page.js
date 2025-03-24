'use client';

import styles from "./page.module.css";
import postStyles from "@/app/user/home/entries/postEntry.module.css";
import {GlobalStuff, initGlobalState, logout} from "@/lib/globalStateStuff";
import {useEffect, useState} from "react";
import MainFooter from "@/comp/mainFooter";
import {getWithAuth} from "@/lib/req";
import Link from "next/link";
import {goPath} from "@/lib/goPath";
import {usePathname} from "next/navigation";
import PostEntry from "@/app/user/home/entries/postEntry";
import NewsEntry from "@/app/user/home/entries/newsEntry";
import EntryList from "@/app/user/home/entries/EntryList";
import {sleep} from "@/lib/utils";
import {transformPostObjArr} from "@/app/user/home/postTools";
import Image from "next/image";

export default function Home() {
    const pathName = usePathname();
    let [showBurgerMenu, setBurger] = useState(false);
    let [postArr, setPostArr] = useState([]);
    let [newsArr, setNewsArr] = useState([]);
    let [username, setUsername] = useState("...");
    let [admin, setAdmin] = useState(false);

    async function loadPosts() {
        console.log("> Loading posts");
        let res = await getWithAuth("/user/post", {"query-limit": 10});
        if (res === undefined)
            return alert("Failed to get posts");
        setPostArr(await transformPostObjArr(res));
    }

    let morePostBusy = false;

    async function loadMorePosts() {
        // console.log("> Loading more posts");
        if (morePostBusy)
            return;
        morePostBusy = true;

        try {
            const start = postArr.length;
            const limit = 10;

            const tRes1 = getWithAuth("/user/post", {"query-start": start, "query-limit": limit});
            const tRes2 = getWithAuth("/user/post", {"query-start": 0, "query-limit": 1});
            let res1 = await tRes1;
            let res2 = await tRes2;
            if (res1 === undefined || res2 === undefined) {
                alert("Failed to get more posts");
                await sleep(200);
                morePostBusy = false;
                return;
            }
            const transformed1 = await transformPostObjArr(res1);
            const transformed2 = await transformPostObjArr(res2);
            const newArr = postArr.concat(transformed1);

            if (newArr.length !== start + transformed1.length || transformed2.length == 0) { // if multiple requests are made at the same time
                await sleep(50);
                morePostBusy = false;
                return;
            }

            // means that more posts were made
            if (JSON.stringify(newArr[0]) !== JSON.stringify(transformed2[0])) {
                console.info("> NEW POSTS WERE MADE")

                const totalCount = newArr.length;
                let postRes = [];
                const step = 30;
                for (let i = 0; i < totalCount; i += step) {
                    // console.log("> Getting more posts: ", i, step);
                    let res = await getWithAuth("/user/post", {"query-start": i, "query-limit": step});
                    if (res === undefined) {
                        alert("Failed to get more posts");
                        await sleep(200);
                        morePostBusy = false;
                        return;
                    }
                    postRes = postRes.concat(res);
                }
                postRes = await transformPostObjArr(postRes);
                setPostArr(postRes);
                morePostBusy = false;
                return;
            }

            let changed = newArr.length !== postArr.length;
            // console.log("> New Posts:", newArr.length, postArr.length, changed);
            if (changed)
                setPostArr(newArr);
        } catch (e) {
            console.error(e);
        }

        await sleep(200);
        morePostBusy = false;
    }

    async function loadNews() {
        console.log("> Loading news");
        let res = await getWithAuth("/user/post/news", {"query-limit": 10});
        if (res === undefined)
            return alert("Failed to get news");
        setNewsArr(await transformPostObjArr(res));
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
        if (pos < window.innerHeight + 300 && pos > window.innerHeight - 180) {
            loadMorePosts();
        }
    }

    useEffect(() => {
        initGlobalState(pathName, true, false, async () => {
            if (!GlobalStuff.loggedIn)
                goPath("/guest/login");

            setUsername(GlobalStuff.userId);
            setAdmin(GlobalStuff.admin);

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
                    bottom: "80px",
                    right: "60px",
                    width: "50px",
                    height: "50px",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "block",
                }} src={"/goofy-media-front/write_icon.png"} alt={"Write Icon"} width={"100"} height={"100"}
                onClick={() => {goPath("/user/post_composer")}}></Image>

                <nav id={"goofy-nav"} className={showBurgerMenu ? styles.NavBar2 : styles.NavBar}>
                    <div className={styles.NavBarHamburg}>
                        <button onClick={() => {
                            setBurger(!showBurgerMenu);
                        }}>{showBurgerMenu ? "^" : "v"}</button>
                        <h2>Goofy Media</h2>
                    </div>
                    <div className={showBurgerMenu ? styles.None : styles.NavBarDiv}>
                        {showBurgerMenu ? <></> : <h2>Navigation</h2>}
                        <p>
                            <Link href={"/user/home"}>Home</Link><br/>
                            <Link href={"/"}>Index</Link><br/>
                            {admin ? (<><Link href={"/admin/dashboard"}>Admin Dashboard</Link><br/></>) : (<></>)}
                            <Link href={"/guest/login"}>Login</Link><br/>
                            <a onClick={async () => {
                                await logout();
                                goPath("/guest/login")
                            }}>Logout</a><br/>
                            <Link href={"/user/account_settings"}>Account Settings</Link><br/>
                            <Link href={"/user/post_composer"}>Post Composer</Link><br/>
                        </p>
                    </div>
                </nav>

                <div id={"goofy-posts"} className={styles.MainContent} onScroll={onPostScroll}>
                    <div className={styles.PostDiv}>
                        <h2>Hi, @{username}</h2>

                        Cool Posts below: &nbsp;
                        <button onClick={loadPosts}>Refresh</button>
                        <EntryList elements={postArr} compFn={(post) => (<PostEntry post={post}></PostEntry>)} extra={(<div
                            className={postStyles.PostEntryDiv}>
                            <button id={"load-more-posts-btn"} className={"cont-btn"} onClick={loadMorePosts}>Load
                                More Posts
                            </button>
                        </div>)}></EntryList>
                    </div>

                    <div className={styles.NewsDiv}>
                        <h2>Goofy Media News</h2>

                        Cool News below: &nbsp;
                        <button onClick={loadNews}>Refresh</button>
                        <EntryList elements={newsArr} compFn={(post) => (<NewsEntry post={post}></NewsEntry>)}></EntryList>
                    </div>
                </div>
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

'use client';

import styles from "./page.module.css";
import {GlobalStuff, initGlobalState, logout} from "@/lib/globalStateStuff";
import {useEffect, useState} from "react";
import MainFooter from "@/comp/mainFooter";
import {getWithAuth} from "@/lib/req";
import Link from "next/link";
import {goPath} from "@/lib/goPath";
import {usePathname} from "next/navigation";

export default function Home() {
    const pathName = usePathname();
    let [showBurgerMenu, setBurger] = useState(false);
    let [postArr, setPostArr] = useState([]);
    let [newsArr, setNewsArr] = useState([]);

    async function transformPostObjArr(postObjArr) {
        let posts = [];
        for (let postObj of postObjArr) {
            let post = {
                title: postObj.post.title,
                text: postObj.post.text,
                author: postObj.userId,
                displayName: "Display Name",
                createdAt: postObj.post.createdAt,
                tags: postObj.post.tags,
            };

            // TODO: verify each post with signature

            posts.push(post);
        }

        console.log("> Posts:", postObjArr, " -> ", posts);
        return posts;
    }

    async function loadPosts() {
        console.log("> Loading posts");
        let res = await getWithAuth("/user/post", {"query-limit": 10});
        if (res === undefined)
            return alert("Failed to get posts");
        setPostArr(await transformPostObjArr(res));
    }

    const sleep = async (ms) => new Promise(r => setTimeout(r, ms));
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
    async function onPostScroll(forced) {
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
        <div className={styles.page}>
            <main className={styles.main}>

                <nav className={showBurgerMenu ? styles.NavBar2 : styles.NavBar}>
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
                            <Link href={"/guest/login"}>Login</Link><br/>
                            <a onClick={async () => {await logout(); goPath("/guest/login")}}>Logout</a><br/>
                            <Link href={"/admin/dashboard"}>Admin Dashboard</Link><br/>
                            <Link href={"/user/post_composer"}>Post Composer</Link><br/>
                        </p>
                    </div>
                </nav>

                <div className={styles.MainContent} onScroll={onPostScroll}>
                    <div className={styles.PostDiv}>
                        <h1>User Home</h1>

                        Cool Posts below: &nbsp;
                        <button onClick={() => {
                            loadPosts()
                        }}>Refresh</button>


                        <div>
                            <ul style={{listStyle: "none"}}>
                                {postArr.map((post, index) => {
                                    return (
                                        <li key={index}>

                                            <div className={styles.PostEntry}
                                                 style={{border: "2px solid #8080F0", padding: "10px", margin: "10px"}}>
                                                <div
                                                    style={{textAlign: "left", marginBottom: "5px"}}>
                                                    <b>{post.displayName}</b> @{post.author} - {new Date(post.createdAt).toLocaleString()}
                                                </div>
                                                <h3 style={{
                                                    textAlign: "left",
                                                    marginBottom: "15px",
                                                    display: "block"
                                                }}>{post.title}
                                                </h3>
                                                <p style={{
                                                    marginBottom: "15px",
                                                    whiteSpace: "pre-line"
                                                }}>{post.text}</p>
                                                <p>Tags: {post.tags.map((tag, idx) => {
                                                    return (<span key={idx}><a>#{tag}</a>&nbsp;</span>);
                                                })}</p>
                                            </div>
                                        </li>
                                    );
                                })}

                                <div className={styles.PostEntry}
                                     style={{border: "2px solid #8080F0", padding: "10px", margin: "10px"}}>
                                    <button id={"load-more-posts-btn"} className={"cont-btn"} onClick={loadMorePosts}>Load More Posts</button>
                                </div>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.NewsDiv}>
                        <h2>Goofy Media News</h2>

                        Cool News below: &nbsp;
                        <button onClick={() => {
                            loadNews()
                        }}>Refresh</button>

                        <div>
                            <ul style={{listStyle: "none"}}>
                                {newsArr.map((post, index) => {
                                    return (
                                        <li key={index}>

                                            <div style={{border: "2px solid #8080D0", padding: "10px", margin: "10px"}}>
                                                <h3 style={{
                                                    textAlign: "left",
                                                    marginBottom: "15px",
                                                    display: "block"
                                                }}>{post.title}
                                                </h3>
                                                <p style={{
                                                    marginBottom: "15px",
                                                    whiteSpace: "pre-line"
                                                }}>{post.text}</p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

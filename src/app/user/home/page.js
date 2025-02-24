'use client';

import styles from "./page.module.css";
import {GlobalStuff, initGlobalState} from "@/lib/globalStateStuff";
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
        console.log("> Post Objs:", postObjArr);

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


        console.log("> Posts:", posts);
        return posts;
    }

    async function loadPosts() {
        console.log("> Loading posts");
        let res = await getWithAuth("/user/post");
        if (res === undefined)
            return alert("Failed to get posts");
        setPostArr(await transformPostObjArr(res));
    }

    async function loadNews() {
        console.log("> Loading news");
        let res = await getWithAuth("/user/post/news");
        if (res === undefined)
            return alert("Failed to get news");
        setNewsArr(await transformPostObjArr(res));
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
                            <a onClick={() => {localStorage.clear(); goPath("/guest/login");}}>Logout</a><br/>
                            <Link href={"/admin/dashboard"}>Admin Dashboard</Link><br/>
                            <Link href={"/user/post_composer"}>Post Composer</Link><br/>
                        </p>
                    </div>
                </nav>

                <div className={styles.MainContent}>
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

                                            <div className={styles.PostEntry} style={{border: "2px solid #8080F0", padding: "10px", margin: "10px"}}>
                                                <div
                                                    style={{textAlign: "left", marginBottom: "5px"}}>
                                                    <b>{post.displayName}</b> @{post.author} - {new Date(post.createdAt).toLocaleString()}</div>
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

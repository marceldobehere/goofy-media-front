'use client';

import styles from "./page.module.css";
import Link from "next/link";
import MainFooter from "@/comp/mainFooter";
import {useEffect, useState} from "react";
import {initGlobalState} from "@/lib/globalStateStuff";
import {usePathname} from "next/navigation";
import {loadPost} from "@/lib/post/postUtils";
import PostEntry from "@/app/user/home/entries/postEntry";

export default function Home() {
    const pathName = usePathname();
    const [postData, setPost] = useState();
    useEffect(() => {
        initGlobalState(pathName, false, false, async () => {
            if (postData !== undefined)
                return;

            const query = new URLSearchParams(window.location.search);
            console.log("> Search: ", window.location.search)
            console.log("> Query: ", query)
            const uuid = query.get("uuid");
            console.log("> UUID: ", uuid);

            const post = await loadPost(uuid);
            if (post == undefined) {
                alert("Failed to get post");
                return;
            }

            console.log(post);
            setPost(post);
        });
    });

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.PostDiv}>
                    <h1>Post</h1>

                    {postData != undefined ?
                        <PostEntry post={postData}></PostEntry> : <></>}

                    <br/><br/>

                    <h3>Comments:</h3>

                    <p>No comments implemented yet.</p>
                </div>
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

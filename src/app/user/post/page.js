'use client';

import styles from "./page.module.css";
import Link from "next/link";
import MainFooter from "@/comp/mainFooter";
import {useEffect, useState} from "react";
import {GlobalStuff, initGlobalState} from "@/lib/globalStateStuff";
import {usePathname} from "next/navigation";
import {loadPost} from "@/lib/post/postUtils";
import PostEntry from "@/app/user/home/entries/postEntry";
import {loadCommentsForPost} from "@/lib/post/commentUitls";
import {signObj} from "@/lib/rsa";
import {postWithAuth} from "@/lib/req";
import CommentEntry from "@/app/user/post/entries/commentEntry";
import EntryList from "@/app/user/home/entries/EntryList";

export default function PostPage() {
    const pathName = usePathname();
    const [postData, setPost] = useState();
    const [comments, setComments] = useState([]);

    async function refreshComments(uuid) {
        if (uuid == undefined)
            uuid = postData.uuid;

        await loadThePost(uuid);
        const commentArr = await loadCommentsForPost(uuid);
        // console.log(commentArr);
        setComments([]);
        if (commentArr == undefined)
            return alert("Failed to get comments");

        setTimeout(() => {
            setComments(commentArr);
        }, 50);
    }

    async function loadThePost(uuid) {
        if (uuid == undefined)
            uuid = postData.uuid;

        const post = await loadPost(uuid);
        if (post == undefined) {
            alert("Failed to get post");
            return;
        }

        console.log(post);
        setPost(post);
    }

    useEffect(() => {
        initGlobalState(pathName, false, false, async () => {
            if (postData !== undefined)
                return;

            const query = new URLSearchParams(window.location.search);
            console.log("> Search: ", window.location.search)
            console.log("> Query: ", query)
            const uuid = query.get("uuid");
            console.log("> UUID: ", uuid);

            await refreshComments(uuid);
        });
    });

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.PostDiv}>
                    <h1>Post</h1>

                    {postData != undefined ?
                        <>
                            <PostEntry post={postData}></PostEntry>
                            <button id={"copy-post-link"} style={{float: "right"}} onClick={() => {
                                const URL = `${GlobalStuff.server}/smol/post/${postData.uuid}`;
                                navigator.clipboard.writeText(URL);
                                const button = document.getElementById("copy-post-link");
                                button.innerText = "Copied!";
                                setTimeout(() => {
                                    button.innerText = "Copy Smol Link";
                                }, 2000);
                            }}>Copy Smol Link
                            </button>

                        </> : <></>}

                    <br/><br/>

                    <h3>Comments:
                        &#32;&nbsp;&#32;
                        <button onClick={() => {
                            refreshComments()
                        }}>Refresh</button>
                        &#32;&nbsp;&#32;
                        <button onClick={async () => {
                            const text = prompt("Enter text to comment:");
                            if (text == undefined || text == "")
                                return;

                            const comment = {
                                text: text,
                                postUuid: postData.uuid,
                                createdAt: Date.now(),
                                replyCommentUuid: undefined
                            };

                            const signature = await signObj(comment);

                            const mainBody = {
                                comment: comment,
                                signature: signature,
                                publicKey: GlobalStuff.publicKey,
                                userId: GlobalStuff.userId
                            };
                            console.log(mainBody);

                            const res = await postWithAuth("/user/comment/", {comment: mainBody});
                            if (res === undefined) {
                                alert("Failed to comment");
                                return;
                            }

                            refreshComments();
                        }}>Add Comment
                        </button>
                    </h3>


                    <EntryList elements={comments}
                               compFn={(comment) => (<CommentEntry comment={{...comment, updateFunc: loadThePost}}></CommentEntry>)}></EntryList>

                    <br/>
                </div>
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

'use client';

import styles from "./page.module.css";
import usefulStyles from "@/comp/useful.module.css"
import {useState} from "react";
import {GlobalStuff, useGlobalState} from "@/lib/globalStateStuff";
import {usePathname} from "next/navigation";
import {loadPost} from "@/lib/post/postUtils";
import PostEntry from "@/app/user/home/entries/postEntry";
import {loadCommentsForPost} from "@/lib/post/commentUitls";
import {signObj} from "@/lib/rsa";
import {postWithAuth} from "@/lib/req";
import CommentEntry from "@/app/user/post/entries/commentEntry";
import EntryList from "@/app/user/home/entries/EntryList";
import UnifiedMenu from "@/comp/unified_layout/unifiedMenu";

export default function PostPage() {
    const pathName = usePathname();
    const [postData, setPost] = useState();
    const [comments, setComments] = useState([]);

    async function refreshComments(uuid, scroll) {
        if (uuid == undefined)
            uuid = postData.uuid;

        loadThePost(uuid);
        const commentArr = await loadCommentsForPost(uuid);
        setComments([]);
        if (commentArr == undefined)
            return alert("Failed to get comments");

        setComments(commentArr);
        if (scroll)
            setTimeout(() => {
                const commentsDiv = document.getElementById("comments");
                if (commentsDiv == null)
                    return;
                commentsDiv.scrollIntoView({behavior: "smooth"});
            }, 100);
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

    useGlobalState(pathName, true, false, async () => {
        if (postData !== undefined)
            return;

        const query = new URLSearchParams(window.location.search);
        console.log("> Search: ", window.location.search)
        console.log("> Query: ", query)
        const uuid = query.get("uuid");
        console.log("> UUID: ", uuid);
        const scrollToComments = query.get("scrollToComments");
        await refreshComments(uuid, (scrollToComments == "true"));
    });

    return <UnifiedMenu
        divSizes={{left: "20vw", main: "60vw", right: "20vw"}}
        mainDivData={
            <div className={usefulStyles.CenterContentDiv}>
                <h1>Post</h1>

                {postData != undefined ?
                    <div className={styles.PostDiv}>
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
                        <button id={"copy-post-uuid"} style={{float: "right", marginRight: "1rem"}} onClick={() => {
                            navigator.clipboard.writeText(postData.uuid);
                            const button = document.getElementById("copy-post-uuid");
                            button.innerText = "Copied!";
                            setTimeout(() => {
                                button.innerText = "Copy Post UUID";
                            }, 2000);
                        }}>Copy Post UUID
                        </button>

                    </div> : <></>}

                <br/><br/>

                <h3 id={"comments"}>Comments:
                    &#32;&nbsp;&#32;
                    <button onClick={() => {
                        refreshComments()
                    }}>Refresh
                    </button>
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
                    }} disabled={!GlobalStuff.loggedIn}>Add Comment
                    </button>
                </h3>


                <EntryList elements={comments}
                           compFn={(comment) => (<CommentEntry comment={{
                               ...comment,
                               updateFunc: loadThePost,
                               overrideClick: true
                           }}></CommentEntry>)} keyFn={(comment) => (comment.uuid)}></EntryList>

                <br/>
            </div>
        }
    />;
}

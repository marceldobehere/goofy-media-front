'use client';

import styles from "@/app/user/post/entries/commentEntry.module.css";
import {useState} from "react";
import {basePath} from "@/lib/goPath";
import {GlobalStuff} from "@/lib/globalStateStuff";
import {loadRepliesForComment} from "@/lib/post/commentUitls";
import EntryList from "@/app/user/home/entries/EntryList";
import {signObj} from "@/lib/rsa";
import {postWithAuth} from "@/lib/req";

export default function CommentEntry({comment}) {
    const [isValid, setIsValid] = useState();
    const [replies, setReplies] = useState(undefined);
    // console.log(comment)

    // setIsValid(undefined);
    if (isValid == undefined)
        if (comment.valid)
            comment.valid().then((res) => {
                setIsValid(res);
            })

    const validStuff = [
        {emoji: "❌", title: `Error: ${isValid ? isValid.error : ""}`},
        {emoji: "✅", title: "Comment is valid"},
        {emoji: "?", title: "Comment is being validated..."}
    ];
    const validChoice = validStuff[isValid ? (isValid.ok ? 1 : 0) : 2];

    async function loadReplies() {
        const replies = await loadRepliesForComment(comment.uuid);
        if (replies == undefined)
            return alert("Failed to get replies");
        setReplies(replies);
    }

    return <div className={styles.CommentDiv} style={{position: "relative"}}>
        <div className={styles.CommentUserHeader}>
            <b>{comment.displayName}</b> <a style={{textDecoration: "none"}}
                                         href={`${basePath}/user/profile?userId=${encodeURIComponent(comment.userId)}&serverId=${encodeURIComponent(GlobalStuff.server)}`}>@{comment.userId}</a> - {new Date(comment.createdAt).toLocaleString()}
        </div>

        {comment.text}

        <br/><br/>
        {replies == undefined ?
        <>
            <button onClick={async () => {
                loadReplies()
            }}>Show replies</button>
        </> :
            <>
                <EntryList elements={replies}
                           compFn={(comment) => (<CommentEntry comment={comment}></CommentEntry>)}></EntryList>

                <button onClick={async () => {
                    const text = prompt("Enter text to reply:");
                    if (text == undefined || text == "")
                        return;

                    const _comment = {
                        text: text,
                        postUuid: comment.postUuid,
                        createdAt: Date.now(),
                        replyCommentUuid: comment.uuid
                    };

                    const signature = await signObj(_comment);

                    const mainBody = {
                        comment: _comment,
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
                    loadReplies()
                }}>Add Reply
                </button>
                <br/>
            </>}

        <div style={{display: "inline", position: "absolute", bottom: "5px", right: "5px"}}
             title={validChoice.title}>{validChoice.emoji}</div>
    </div>;
}
'use client';

import styles from "@/app/user/post/entries/commentEntry.module.css";
import {useState} from "react";
import {basePath, refreshPage} from "@/lib/goPath";
import {GlobalStuff, useGlobalState} from "@/lib/globalStateStuff";
import {deleteComment, loadRepliesForComment, loadReplyCountForComment} from "@/lib/post/commentUitls";
import EntryList from "@/app/user/home/entries/EntryList";
import {signObj} from "@/lib/rsa";
import {postWithAuth} from "@/lib/req";
import {usePathname} from "next/navigation";
import {getProfileUrl} from "@/lib/publicInfo/links";

export default function CommentEntry({comment}) {
    const pathName = usePathname();
    const [isValid, setIsValid] = useState();
    const [replies, setReplies] = useState(undefined);
    const [replyCount, setReplyCount] = useState(comment.replyCount);
    const [displayName, setDisplayName] = useState();
    let [canDelete, setCanDelete] = useState(false);

    useGlobalState(pathName, false, false, async () => {
        if (GlobalStuff.admin || comment.userId == GlobalStuff.userId)
            setCanDelete(true);
    });

    // setIsValid(undefined);
    if (isValid == undefined)
        if (comment.valid)
            comment.valid().then((res) => {
                setIsValid(res);
            })

    if (displayName == undefined)
        if (comment.displayName)
            comment.displayName().then((res) => {
                setDisplayName(res);
            });

    const validStuff = [
        {emoji: "❌", title: `Error: ${isValid ? isValid.error : ""}`},
        {emoji: "✅", title: "Comment is valid"},
        {emoji: "?", title: "Comment is being validated..."}
    ];
    const validChoice = validStuff[isValid ? (isValid.ok ? 1 : 0) : 2];

    async function loadReplies() {
        const _replies = loadRepliesForComment(comment.uuid);
        const _replyCount = loadReplyCountForComment(comment.uuid);

        const replies = await _replies;
        const replyCount = await _replyCount;
        console.log(replyCount)

        if (replies == undefined)
            return alert("Failed to get replies");
        else
            setReplies(replies);

        if (replyCount == undefined)
            return alert("Failed to get reply count");
        else
            setReplyCount(replyCount);

        if (comment.updateFunc) {
            await comment.updateFunc();
        }
    }

    async function addReply() {
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
    }


    const delButton = canDelete ?
        <button onClick={async () => {
            if (confirm("Are you sure you want to delete the comment?")) {
                if (await deleteComment(comment.uuid))
                    alert("Comment deleted");
                else
                    alert("Comment deletion failed!")
            }

            refreshPage();
        }}>Delete</button> : <></>;

    return <div className={styles.CommentDiv} style={{position: "relative"}}>
        <div className={styles.CommentUserHeader}>
            <b>{displayName ? displayName : "?"}</b> <a style={{textDecoration: "none"}}
                                                        href={getProfileUrl(comment.userId)}>@{comment.userId}</a> - {new Date(comment.createdAt).toLocaleString()}
        </div>
        <hr/>

        <div className={styles.CommentBody}>
            {comment.text}
        </div>

        <hr style={{marginBottom: "10px"}}/>
        <div className={styles.CommentFooter}>
            {replies == undefined ?
                <>
                    <div className={styles.CommentButtonDiv}>
                        <button onClick={loadReplies}>Show {replyCount} repl{(replyCount == 1) ? "y" : "ies"}</button>
                        {delButton}
                    </div>
                </> :
                <>
                    <h4>Replies:</h4>
                    <EntryList elements={replies}
                               compFn={(_comment) => (
                                   <CommentEntry
                                       comment={{..._comment, updateFunc: comment.updateFunc}}></CommentEntry>)}
                               keyFn={(comment) => (comment.uuid)}></EntryList>

                    <div className={styles.CommentButtonDiv}>
                        <button onClick={addReply} disabled={!GlobalStuff.loggedIn}>Add Reply
                        </button>
                        <button onClick={loadReplies}>Refresh
                        </button>
                        <button onClick={() => {
                            setReplies(undefined)
                        }}>Hide replies
                        </button>
                        {delButton}
                    </div>
                </>}
        </div>

        <div style={{display: "inline", position: "absolute", bottom: "5px", right: "5px"}}
             title={validChoice.title}>{validChoice.emoji}</div>
    </div>;
}
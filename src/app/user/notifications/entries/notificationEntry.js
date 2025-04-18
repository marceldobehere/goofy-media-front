'use client';

import styles from "@/app/user/notifications/entries/notificationEntry.module.css";
import {useEffect, useState} from "react";
import {loadPost} from "@/lib/post/postUtils";
import {basePath} from "@/lib/goPath";
import {GlobalStuff, useGlobalState} from "@/lib/globalStateStuff";
import {getRandomIntInclusive} from "@/lib/cryptoUtils";
import {loadCommentByUuid} from "@/lib/post/commentUitls";
import {usePathname} from "next/navigation";
import {getDisplayNameFromUserId} from "@/lib/publicInfo/publicInfoUtils";
import {getPostUrl, getProfileUrl} from "@/lib/publicInfo/links";

export default function NotificationEntry({notification}) {
    const pathName = usePathname();
    const [postTitle, setPostTitle] = useState(undefined);
    const [commentText1, setCommentText1] = useState(undefined);
    const [commentText2, setCommentText2] = useState(undefined);
    const [displayName, setDisplayName] = useState(undefined);

    const userIdLink = <a
        href={getProfileUrl(notification.otherUserId)}
        target={"_blank"} style={{textDecoration: "none", fontWeight: "bold"}}
    >{displayName ? <span>{displayName} <span style={{fontWeight:"normal"}}>(@{notification.otherUserId})</span></span> : `@${notification.otherUserId}`}</a>;

    const postLink = <span>
        {postTitle == undefined ? "" : "post "}
        <a href={getPostUrl(notification.postUuid)}
           target={"_blank"}
           style={{textDecoration: "none", fontWeight: "bold"}}
        >{postTitle == undefined ? "post" : postTitle}</a>
    </span>;

    const commentLink = <a
        href={`${getPostUrl(notification.postUuid)}&markComment=${encodeURIComponent(notification.commentUuid)}`}
        target={"_blank"} style={{textDecoration: "none", fontWeight: "bold"}}
    >comment</a>;


    let resElement = <h4>Unknown Type: {notification.type} - {JSON.stringify(notification)}</h4>;
    if (notification.type == "comment")
        resElement = <span>{userIdLink} commented on your {postLink}</span>;
    else if (notification.type == "reply")
        resElement = <span>{userIdLink} replied to your {commentLink} on the {postLink}:</span>;
    else if (notification.type == "mention")
        resElement = <span>{userIdLink} mentioned you in their {postLink}</span>;
    else if (notification.type == "like")
        resElement = <span>{userIdLink} liked your {postLink}</span>;
    else if (notification.type == "follow")
        resElement = <span>{userIdLink} followed you</span>;

    useGlobalState(pathName, false, false, async () => {
        if (notification.otherUserId == undefined)
            return;
        const res = await getDisplayNameFromUserId(notification.otherUserId);
        if (res != undefined)
            setDisplayName(res);

    }, () => {
        setTimeout(async () => {
            if (notification.type == "comment") {
                if (postTitle == undefined) {
                    const post = await loadPost(notification.postUuid);
                    if (post)
                        setPostTitle(post.title);

                    const comment = await loadCommentByUuid(notification.commentResponseUuid);
                    if (comment)
                        setCommentText1(`Them> ${comment.text}`);
                }
            } else if (notification.type == "reply") {
                if (postTitle == undefined) {
                    const post = await loadPost(notification.postUuid);
                    if (post)
                        setPostTitle(post.title);

                    const comment1 = await loadCommentByUuid(notification.commentUuid);
                    if (comment1)
                        setCommentText1(`You: ${comment1.text}`);

                    const comment2 = await loadCommentByUuid(notification.commentResponseUuid);
                    if (comment2)
                        setCommentText2(`Them: ${comment2.text}`);
                }
            } else if (notification.type == "mention") {
                if (postTitle == undefined) {
                    const post = await loadPost(notification.postUuid);
                    if (post)
                        setPostTitle(post.title);
                }
            } else if (notification.type == "like") {
                if (postTitle == undefined) {
                    const post = await loadPost(notification.postUuid);
                    if (post)
                        setPostTitle(post.title);
                }
            }
        }, getRandomIntInclusive(80,500));
    })

    return (
        <div className={`${styles.NotificationEntryDiv} ${notification.isRead ? styles.Read : styles.Unread}`}>
            <span className={styles.NotificationTime}>{new Date(notification.createdAt).toLocaleString()}</span><br/>
            {resElement}
            {commentText1 == undefined ? "" : <><br/><div style={{padding:"5px", marginTop:"10px", background: "rgba(0,0,0,0.4)"}}>{commentText1}</div></>}
            {commentText2 == undefined ? "" : <><div style={{padding:"5px", marginTop:"10px", background: "rgba(0,0,0,0.4)"}}>{commentText2}</div></>}
        </div>)
}
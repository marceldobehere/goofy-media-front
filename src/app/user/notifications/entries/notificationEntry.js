'use client';

import styles from "@/app/user/notifications/entries/notificationEntry.module.css";
import {useState} from "react";
import {loadPost} from "@/lib/post/postUtils";
import {useGlobalState} from "@/lib/globalStateStuff";
import {getRandomIntInclusive} from "@/lib/cryptoUtils";
import {loadCommentByUuid} from "@/lib/post/commentUitls";
import {usePathname} from "next/navigation";
import {getDisplayNameFromUserId, getUserPfpFromUserId} from "@/lib/publicInfo/publicInfoUtils";
import {getPostUrl, getProfileUrl} from "@/lib/publicInfo/links";
import {convertTextWithEmojis} from "@/lib/emoji/emojiUtils";

export default function NotificationEntry({notification}) {
    const pathName = usePathname();
    const [postTitle, setPostTitle] = useState(undefined);
    const [commentText1, setCommentText1] = useState(undefined);
    const [commentText2, setCommentText2] = useState(undefined);
    const [displayName, setDisplayName] = useState(undefined);
    const [pfpUrl, setPfpUrl] = useState(undefined);

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

        setDisplayName(await getDisplayNameFromUserId(notification.otherUserId));
        setPfpUrl(await getUserPfpFromUserId(notification.otherUserId));
    }, () => {
        setTimeout(async () => {
            if (notification.type == "comment") {
                if (postTitle == undefined) {
                    const post = await loadPost(notification.postUuid);
                    if (post)
                        setPostTitle(post.title);

                    const comment = await loadCommentByUuid(notification.commentResponseUuid);
                    if (comment)
                        setCommentText1(`Comment: ${convertTextWithEmojis(comment.text)}`);
                }
            } else if (notification.type == "reply") {
                if (postTitle == undefined) {
                    const post = await loadPost(notification.postUuid);
                    if (post)
                        setPostTitle(post.title);

                    const comment1 = await loadCommentByUuid(notification.commentUuid);
                    if (comment1)
                        setCommentText1(`You: ${convertTextWithEmojis(comment1.text)}`);

                    const comment2 = await loadCommentByUuid(notification.commentResponseUuid);
                    if (comment2)
                        setCommentText2(`Reply: ${convertTextWithEmojis(comment2.text)}`);
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
        }, getRandomIntInclusive(40,200));
    })

    return (
        <div className={`${styles.NotificationEntryDiv} ${notification.isRead ? styles.Read : styles.Unread}`}>
            <div className={styles.NotificationEntryDivStart}>
                <img alt={"Profile Picture"} src={pfpUrl ? pfpUrl : "/goofy-media-front/unknown_user.png"}></img>
                <div>
                    <span className={styles.NotificationTime}>{new Date(notification.createdAt).toLocaleString()}</span><br/>
                    {resElement}
                </div>
            </div>
            {commentText1 == undefined && commentText2 == undefined ? "" : <hr/>}
            {commentText1 == undefined ? "" : <>
                <div style={{padding: "5px", marginTop: "10px", background: "rgba(0,0,0,0.4)"}}>{commentText1}</div>
            </>}
            {commentText2 == undefined ? "" : <>
                <div style={{padding: "5px", marginTop: "10px", background: "rgba(0,0,0,0.4)"}}>{commentText2}</div>
            </>}
        </div>)
}
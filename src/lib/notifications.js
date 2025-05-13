'use client';

import {LocalSettings} from "@/lib/localSettings";
import {loadPost} from "@/lib/post/postUtils";
import {loadCommentByUuid} from "@/lib/post/commentUitls";
import {convertTextWithEmojis} from "@/lib/emoji/emojiUtils";
import {getDisplayNameFromUserId, getUserPfpFromUserId} from "@/lib/publicInfo/publicInfoUtils";

let notificationsWork = false;
export async function checkNotifications()
{
    console.log("> Checking notifications")
    notificationsWork = false;
    if (window.location.protocol != "https:" && window.location.protocol != "http:"
        && window.location.protocol != "localhost:"
    )
        return console.log("Notifications not allowed: " + window.location.protocol);

    if (!(LocalSettings.generalNotificationType == "notification" || LocalSettings.newPostNotificationType == "notification"))
        return console.log("Notifications not allowed: " + LocalSettings.generalNotificationType);

    if (!("Notification" in window))
        return console.log("Notifications not allowed: Notification not in window");

    if (Notification.permission === "granted")
    {
        notificationsWork = true;
        await initNotifications();
        return;
    }

    if (Notification.permission !== "denied")
    {
        if (await Notification.requestPermission())
            notificationsWork = true;
        await initNotifications();
    }
}

const windowHasFocus = function () {
    if (document.hasFocus()) return true
    let hasFocus = false

    window.addEventListener('focus', function () {
        hasFocus = true
    })
    window.focus()

    return hasFocus
}

function windowVisible()
{
    return (windowHasFocus() || document.visibilityState == "visible")
}

export function canNotify()
{
    if (!notificationsWork)
        return false;
    if (windowVisible())
        return false;

    return true;
}

let initDone = false;
export async function initNotifications()
{
    if (initDone)
        return;
    initDone = true;
    console.log('> Init Notification System');
    await checkNotifications();
    console.log("> Init Notification Done: " + notificationsWork);
}

export async function playBeep() {
    let audio = new Audio("/goofy-media-front/audio/not.wav");
    try {
        console.log("> Playing audio notification");
        await audio.play();
    } catch (e) {
        console.info("Error playing audio notification", e);
    }
}


async function tryNotify(type, title, body, img, data, callback)
{
    if (type == "notification")
    {
        if (windowVisible())
            return;

        if (!notificationsWork)
            return;

        console.log("> Showing notification");
        let not = new Notification(title, {
            body: body,
            data: data,
            icon: img || "/goofy-media-front/icon.png",
        });
        not.onclick = function (event) {
            console.log("> Notification clicked");
            event.preventDefault();
            if (typeof callback == "function")
                callback(event);
        }
    } else if (type == "audio") {
        await playBeep();
    }
}

async function tryGeneralNotify(title, body, img, data, callback) {
    return await tryNotify(LocalSettings.generalNotificationType, title, body, img, data, callback);
}

async function tryNewPostNotify(title, body, img, data, callback) {
    return await tryNotify(LocalSettings.newPostNotificationType, title, body, img, data, callback);
}


async function getNotificationTextAndTitle(notification) {
    let postTitle = undefined;
    let commentText1 = "";
    let displayName = await getDisplayNameFromUserId(notification.otherUserId);
    let pfpUrl = await getUserPfpFromUserId(notification.otherUserId);

    if (notification.type == "comment") {
        if (postTitle == undefined) {
            const post = await loadPost(notification.postUuid);
            if (post)
                postTitle = post.title;

            const comment = await loadCommentByUuid(notification.commentResponseUuid);
            if (comment)
                commentText1 = `Comment: ${convertTextWithEmojis(comment.text)}`;
        }
    } else if (notification.type == "reply") {
        if (postTitle == undefined) {
            const post = await loadPost(notification.postUuid);
            if (post)
                postTitle = post.title;

            const comment1 = await loadCommentByUuid(notification.commentResponseUuid);
            if (comment1)
                commentText1 = `Reply: ${convertTextWithEmojis(comment1.text)}`;
        }
    } else if (notification.type == "mention") {
        if (postTitle == undefined) {
            const post = await loadPost(notification.postUuid);
            if (post)
                postTitle = post.title;
        }
    } else if (notification.type == "like") {
        if (postTitle == undefined) {
            const post = await loadPost(notification.postUuid);
            if (post)
                postTitle = post.title;
        }
    }

    if (displayName == undefined)
        displayName = `@${notification.otherUserId}`;
    if (postTitle == undefined)
        postTitle = "post";
    else
        postTitle = `post ${postTitle}`;

    if (notification.type == "comment")
        return {
            title: `${displayName} commented on your ${postTitle}`,
            text: commentText1,
            img: pfpUrl,
        }

    if (notification.type == "reply")
        return {
            title: `${displayName} replied to your comment on the ${postTitle}`,
            text: commentText1,
            img: pfpUrl,
        }

    if (notification.type == "mention")
        return {
            title: `You were mentioned in a post`,
            text: `${displayName} mentioned you in their ${postTitle}`,
            img: pfpUrl,
        }

    if (notification.type == "like")
        return {
            title: `${displayName} liked your ${postTitle}`,
            text: "",
            img: pfpUrl,
        }

    if (notification.type == "follow")
        return {
            title: `New Follower`,
            text: `${displayName} followed you`,
            img: pfpUrl,
        }


    console.info(`Unknown notification type: ${notification.type}`, notification)
    return {
        title: `Unknown Type: ${notification.type}`,
        text: JSON.stringify(notification),
        img: pfpUrl,
    }
}

export async function tryGeneralNotification(notification) {
    if (notification == undefined)
        return;

    let {title, text, img} = await getNotificationTextAndTitle(notification);

    let data = {

    };

    let callback = () => {
        window.focus();
    }

    return await tryNotify(LocalSettings.generalNotificationType, title, text, img, data, callback);
}
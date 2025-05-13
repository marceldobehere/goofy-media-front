'use client';

import {getWithAuth, postWithAuth} from "@/lib/req";

export const DEFAULT_NOTIFICATION_LIMIT = 20;
function getPageLimitAndPage(pageLimit, page) {
    if (pageLimit === undefined)
        pageLimit = DEFAULT_NOTIFICATION_LIMIT;
    if (page === undefined || page < 0)
        page = 0;
    return [pageLimit, page];
}


export async function getUnreadNotificationCount() {
    const res = await getWithAuth("/user/notifications/count");
    if (res === undefined)
        return 0;

    const count = res.count;
    if (count === undefined)
        return 0;

    return count;
}

export async function markAllNotificationsAsRead() {
    const res = await postWithAuth("/user/notifications/read-all");
    if (res === undefined)
        return false;

    return true;
}

export async function getNotifications(pageLimit, page) {
    const [limit, pageNum] = getPageLimitAndPage(pageLimit, page);

    // console.log("> Loading notifications");
    const notifications = await getWithAuth("/user/notifications/", {"query-limit": limit + 1, "query-start": pageNum * limit});
    if (notifications === undefined)
        return undefined; // alert("Failed to get notifications");

    const isOnLastPage = notifications.length < limit + 1;
    const isOnFirstPage = pageNum === 0;
    if (notifications.length > limit)
        notifications.pop();
    return {notifications, isOnLastPage, isOnFirstPage};
}

export async function registerUserWebhook(type, webhookUrl) {
    if (type === undefined || webhookUrl === undefined)
        return false;

    // check if type
    if (type !== "all-notifications" && type !== "new-post-in-feed")
        return false;

    const res = await postWithAuth("/user/notifications/register-user-webhook", {
        webhookService: "discord",
        webhookUrl,
        webhookType: type});
    if (res === undefined)
        return false;

    return true;
}

export async function getNewestNotification() {
    const notifications = await getWithAuth("/user/notifications/", {"query-limit": 1, "query-start": 0});
    if (notifications === undefined)
        return undefined; // alert("Failed to get notifications");

    return notifications[0];
}
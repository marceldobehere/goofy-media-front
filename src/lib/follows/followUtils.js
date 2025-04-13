'use client';

import {deleteWithAuth, getWithAuth, postWithAuth} from "@/lib/req";
import {signObj} from "@/lib/rsa";
import {GlobalStuff} from "@/lib/globalStateStuff";

export const DEFAULT_FOLLOWERS_LIMIT = 20;
function getPageLimitAndPage(pageLimit, page) {
    if (pageLimit === undefined)
        pageLimit = DEFAULT_FOLLOWERS_LIMIT;
    if (page === undefined || page < 0)
        page = 0;
    return [pageLimit, page];
}

export async function followUser(userId) {
    const followBody = {
        followingUserId: userId,
        followedAt: Date.now()
    };

    const signature = await signObj(followBody);

    const mainBody = {
        followingUserId: followBody.followingUserId,
        followedAt: followBody.followedAt,
        signature: signature,
        publicKey: GlobalStuff.publicKey,
        userId: GlobalStuff.userId
    };

    const res = await postWithAuth("/user/follows/user", {follow: mainBody});
    if (res === undefined)
        return false;
    return true;
}

export async function unfollowUser(userId) {
    const res = await deleteWithAuth(`/user/follows/user/${encodeURIComponent(userId)}`);
    if (res === undefined)
        return false;
    return true;
}

export async function isUserFollowed(userId) {
    const res = await getWithAuth(`/user/follows/user/${encodeURIComponent(userId)}`);
    if (res === undefined)
        return false;

    return res.followed;
}

export async function getFollowing() {
    // console.log("> Loading following");
    const following = await getWithAuth("/user/follows/following");
    if (following === undefined)
        return undefined; // alert("Failed to get following");
    return {following, isOnLastPage: true, isOnFirstPage: true};
}

export async function getFollowers(pageLimit, page) {
    const [limit, pageNum] = getPageLimitAndPage(pageLimit, page);

    // console.log("> Loading followers");
    const followers = await getWithAuth("/user/follows/followers", {"query-limit": limit + 1, "query-start": pageNum * limit});
    if (followers === undefined)
        return undefined; // alert("Failed to get followers");

    const isOnLastPage = followers.length < limit + 1;
    const isOnFirstPage = pageNum === 0;
    if (followers.length > limit)
        followers.pop();
    return {followers, isOnLastPage, isOnFirstPage};
}
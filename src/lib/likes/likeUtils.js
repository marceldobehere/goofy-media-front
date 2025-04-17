'use client';

import {deleteWithAuth, getWithAuth, postWithAuth} from "@/lib/req";
import {signObj} from "@/lib/rsa";
import {GlobalStuff} from "@/lib/globalStateStuff";
import {transformPostObjArr} from "@/lib/post/postUtils";

export const DEFAULT_NOTIFICATION_LIMIT = 20;
function getPageLimitAndPage(pageLimit, page) {
    if (pageLimit === undefined)
        pageLimit = DEFAULT_NOTIFICATION_LIMIT;
    if (page === undefined || page < 0)
        page = 0;
    return [pageLimit, page];
}



export async function likePost(uuid) {
    const likeBody = {
        postUuid: uuid,
        likedAt: Date.now()
    };

    const signature = await signObj(likeBody);

    const mainBody = {
        postUuid: likeBody.postUuid,
        likedAt: likeBody.likedAt,
        signature: signature,
        publicKey: GlobalStuff.publicKey,
        userId: GlobalStuff.userId
    }

    const res = await postWithAuth("/user/likes/post", {like: mainBody});
    if (res === undefined)
        return false;
    return true;
}

export async function unlikePost(uuid) {
    const res = await deleteWithAuth(`/user/likes/post/${encodeURIComponent(uuid)}`);
    if (res === undefined)
        return false;
    return true;
}

export async function isPostLiked(uuid) {
    const res = await getWithAuth(`/user/likes/post/${encodeURIComponent(uuid)}`);
    if (res === undefined)
        return false;

    return res.liked;
}

export async function getUsersThatLikedPost(uuid) {
    const res = await getWithAuth(`/user/likes/post/likes/${encodeURIComponent(uuid)}`);
    if (res === undefined)
        return undefined;

    return res;

}

export async function getLikedPosts(pageLimit, page) {
    const [limit, pageNum] = getPageLimitAndPage(pageLimit, page);

    const likeRes = await getWithAuth("/user/post/likes", {"query-limit": limit + 1, "query-start": pageNum * limit});
    if (likeRes === undefined)
        return undefined; // alert("Failed to get liked posts");

    const likes = await transformPostObjArr(likeRes);
    if (likes === undefined)
        return undefined; // alert("Failed to transform liked posts");

    const isOnLastPage = likes.length < limit + 1;
    const isOnFirstPage = pageNum === 0;
    if (likes.length > limit)
        likes.pop();
    return {likes, isOnLastPage, isOnFirstPage};
}
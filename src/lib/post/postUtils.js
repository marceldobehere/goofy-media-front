'use client';

import {getWithAuth} from "@/lib/req";
import {verifyObj} from "@/lib/rsa";
import {getHashFromObj, getRandomIntInclusive, userHash} from "@/lib/cryptoUtils";
import {GlobalStuff} from "@/lib/globalStateStuff";
import {sleep} from "@/lib/utils";
import {CoolCache} from "@/lib/coolCache";

export const publicKeyCache = new CoolCache({localStorageKey: "PUBLIC_KEYS"});

const validPostSigCache = new CoolCache({localStorageKey: "POST_SIG_VALID", maxSize: 2000, saveToLocalStorageFreq: 5});

// publicKeyCache.clear();
// validPostSigCache.clear();

export async function getPublicKeyFromUserId(userId) {
    if (userId === undefined || typeof userId !== 'string') {
        console.error("> User ID MISSING");
        return undefined;
    }

    const publicKey = publicKeyCache.get(userId, async () => {
        console.log("> Getting public key for userId: ", userId);
        const res = await getWithAuth(`/user/user-data/${userId}/public-key`);
        if (res === undefined || res.publicKey === undefined) {
            console.info("> Failed to request public key for userId: ", userId);
            throw new Error("Failed to request public key");
        }

        // verify userid -> key mapping
        const actualUserId = await userHash(res.publicKey);
        if (userId !== actualUserId) {
            console.info("> User ID MISMATCH: ", userId, " != ", actualUserId);
            throw new Error("User ID mismatch");
        }

        console.log("> Got public key for userId: ", userId, " -> ", res.publicKey);

        return res.publicKey;
    });

    if (publicKey == undefined) {
        console.error("> Failed to get public key for userId: ", userId);
        return undefined;
    }

    return publicKey;
}

async function verifyPost(postObj) {
    if (postObj === undefined) {
        return "POST OBJ UNDEFINED";
    }

    // Verify Basic Post Structure
    const _post = postObj.post;
    const post = {
        title: _post.title,
        text: _post.text,
        tags: _post.tags,
        createdAt: _post.createdAt
    }
    if (post === undefined) {
        return "POST UNDEFINED";
    }

    if (post.title === undefined || post.text === undefined || post.tags === undefined || post.createdAt === undefined) {
        return "POST MISSING FIELD";
    }

    if (typeof post.title !== 'string' || typeof post.text !== 'string' || !Array.isArray(post.tags) || typeof post.createdAt !== 'number') {
        return "POST FIELD TYPE INCORRECT";
    }

    if (post.title.length > 200 || post.text.length > 5000 || post.tags.length > 50) {
        return "POST FIELD LENGTH INCORRECT";
    }

    // check if post createdAt is a valid date
    if (new Date(post.createdAt).toString() === 'Invalid Date') {
        return "INVALID DATE";
    }

    // check if post is not in the future
    if (post.createdAt > Date.now() + 10000) {
        return "FUTURE DATE";
    }

    post.tags = [...post.tags].sort();
    for (let tag of post.tags) {
        if (typeof tag !== 'string') {
            return "TAG NOT STRING";
        }
        if (tag.length > 100) {
            return "TAG TOO LONG";
        }
        if (tag !== tag.toLowerCase()) {
            return "TAG CONTAINS UPPERCASE";
        }
        if (tag.includes("#")) {
            return "TAG CONTAINS #";
        }
    }

    // Verify Signature
    const signature = postObj.signature;
    if (signature === undefined || typeof signature !== 'string') {
        return "SIGNATURE MISSING";
    }

    // // Verify Public Key
    // const publicKey = postObj.publicKey;
    // if (publicKey === undefined || typeof publicKey !== 'string') {
    //     return "PUBLIC KEY MISSING";
    // }

    // Verify User ID
    const userId = postObj.userId;
    if (userId === undefined || typeof userId !== 'string') {
        return "USER ID MISSING";
    }

    // Get Public Key
    const publicKey = await getPublicKeyFromUserId(userId);
    if (publicKey == undefined) {
        return "USER NOT FOUND";
    }

    // Validate User ID
    const actualUserId = await userHash(publicKey);
    if (userId !== actualUserId) {
        return "USER ID MISMATCH: " + userId + " != " + actualUserId;
    }

    // Validate Signature
    const verified = await verifyObj(post, signature, publicKey);
    if (!verified) {
        return "SIGNATURE INVALID";
    }

    return "OK";
}

export async function validatePostSignature(postEntry) {
    const res = await verifyPost(postEntry);
    return {ok: res === "OK", error: res};
}

export async function transformPostObjArr(postObjArr) {
    let posts = [];
    for (let postObj of postObjArr) {
        let post = {
            title: postObj.post.title,
            text: postObj.post.text,
            author: postObj.userId,
            displayName: "Display Name",
            createdAt: postObj.post.createdAt,
            tags: postObj.post.tags,
            uuid: postObj.uuid,
            commentCount: postObj.commentCount,
            valid: async () => {
                await sleep(getRandomIntInclusive(150, 1000));
                const postHash = await getHashFromObj(postObj);
                const res = await validPostSigCache.get(postHash, async () => {
                    return await validatePostSignature(postObj);
                })
                // For now we dont store the invalid post signatures
                if (res == undefined || !res.ok)
                    await validPostSigCache.delete(postHash);
                return res;
            }
        };

        posts.push(post);
    }

    // console.log("> Posts:", postObjArr, " -> ", posts);
    return posts;
}

async function loadPosts(url, headers) {
    let res = await getWithAuth(url, headers);
    if (res === undefined)
        return alert("Failed to get posts");

    return transformPostObjArr(res);
}

export async function loadPost(uuid) {
    let res = await getWithAuth(`/user/post/uuid/${encodeURIComponent(uuid)}`);
    if (res === undefined)
        return alert("Failed to get post");

    const post = await transformPostObjArr([res]);
    if (post === undefined)
        return alert("Failed to transform post");

    return post[0];
}

export async function getSimilarTags(tag) {
    if (tag == "")
        return [];
    tag = tag.toLowerCase();

    let res = await getWithAuth(`/user/post/tags/like/${tag}`);
    if (res === undefined)
        return alert("Failed to get similar tags");

    return res;
}

export const DEFAULT_POST_LIMIT = 5;
function getPageLimitAndPage(pageLimit, page) {
    if (pageLimit === undefined)
        pageLimit = DEFAULT_POST_LIMIT;
    if (page === undefined || page < 0)
        page = 0;
    return [pageLimit, page];
}

async function loadPostsWithPageData(url, pageLimit, page) {
    [pageLimit, page] = getPageLimitAndPage(pageLimit, page);

    // console.log("> Loading posts");
    const posts = await loadPosts(url, {"query-limit": pageLimit + 1, "query-start": page * pageLimit});
    if (posts === undefined)
        return; // alert("Failed to get posts");

    const isOnLastPage = posts.length < pageLimit + 1;
    const isOnFirstPage = page === 0;
    if (posts.length > pageLimit)
        posts.pop();

    return {posts, isOnLastPage, isOnFirstPage};
}

export async function loadNewsPosts(pageLimit, page) {
    return loadPostsWithPageData("/user/post/news", pageLimit, page);
}

export async function loadSearchPosts(tag, pageLimit, page) {
    tag = tag.toLowerCase();
    return loadPostsWithPageData(`/user/post/tag/${tag}`, pageLimit, page);
}

export async function loadUserPosts(userId, pageLimit, page) {
    const res = await loadPostsWithPageData(`/user/post/user/${userId}`, pageLimit, page);
    if (res === undefined)
        return;
    return res;
}

export async function loadGlobalPosts() {
    const res = await loadPostsWithPageData("/user/post", 10, 0);
    if (res === undefined)
        return;
    return res.posts;
}

export async function loadSearchGlobalPosts(pageLimit, page) {
    return loadPostsWithPageData(`/user/post`, pageLimit, page);
}


export async function loadHomePosts() {
    const res = await loadPostsWithPageData("/user/post/following", 15, 0);
    if (res === undefined)
        return;
    return res.posts;
}

export async function loadHomeNewsPosts() {
    const res = await loadNewsPosts(10, 0);
    if (res === undefined)
        return;
    return res.posts;
}

export function postListGoToPage(query, top) {
    console.log("> New query: ", query);

    // set query params in url
    const searchParams = new URLSearchParams();
    for (let key in query)
        searchParams.set(key, query[key]);

    window.history.pushState({}, "", `${window.location.pathname}?${searchParams}`);

    // scroll up / down
    return () => {
        if (top)
            window.scrollTo(0, 0);
        else
            window.scrollTo(0, document.body.scrollHeight * 2);
    }
}

export function onWindowGoBack(callback) {
    window.onpopstate = (event) => {
        console.log("> Pop state event: ", event);
        const query = new URLSearchParams(window.location.search);
        callback(query);
    }
}

const POST_UPDATE_STEP = 20;
export async function loadMorePostsPartially(oldPosts, url, limit) {
    // console.log("> Loading more posts");
    try {
        const start = oldPosts.length;
        if (limit === undefined)
            limit = DEFAULT_POST_LIMIT;

        let newPosts = loadPosts(url, {"query-start": start, "query-limit": limit});
        let firstPost = loadPosts(url, {"query-start": 0, "query-limit": 1});
        newPosts = await newPosts;
        firstPost = await firstPost;
        if (newPosts === undefined || firstPost === undefined) {
            alert("Failed to get more posts");
            return;
        }

        const newPostArr = oldPosts.concat(newPosts);

        // if multiple requests are made at the same time
        if (newPostArr.length !== start + newPosts.length || firstPost.length === 0)
            return;

        // if no new posts were made
        if (JSON.stringify(newPostArr[0]) === JSON.stringify(firstPost[0]))
            return newPostArr;

        // means that more posts were made
        console.info("> New Posts were made")
        const totalCount = newPostArr.length;
        const posts = [];
        for (let i = 0; i < totalCount; i += POST_UPDATE_STEP) {
            const res = await loadPosts(url, {"query-start": i, "query-limit": POST_UPDATE_STEP});
            if (res === undefined)
                return alert("Failed to get more posts");
            posts.push(...res);
        }

        return posts;
    } catch (e) {
        console.error(e);
    }
}
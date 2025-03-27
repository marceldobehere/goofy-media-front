'use client';

import {getWithAuth} from "@/lib/req";

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
        };

        // TODO: verify each post with signature

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
    return loadPostsWithPageData(`/user/post/tag/${tag}`, pageLimit, page);
}

export async function loadHomePosts() {
    const res = await loadPostsWithPageData("/user/post", 10, 0);
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
            posts.push(res);
        }

        return posts;
    } catch (e) {
        console.error(e);
    }
}
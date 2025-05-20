'use client';

import {deleteWithAuth, getWithAuth} from "@/lib/req";
import {verifyObj} from "@/lib/rsa";
import {getHashFromObj, getRandomIntInclusive, userHash} from "@/lib/cryptoUtils";
import {sleep} from "@/lib/utils";
import {CoolCache} from "@/lib/coolCache";
import {getDisplayNameFromUserId, getPublicKeyFromUserId, getUserPfpFromUserId} from "@/lib/publicInfo/publicInfoUtils";


const validCommentSigCache = new CoolCache({localStorageKey: "COMMENT_SIG_VALID", maxSize: 2000, saveToLocalStorageFreq: 5});

// publicKeyCache.clear();
// validCommentSigCache.clear();

const MAX_COMMENT_LEN = 1000;

async function verifyComment(mComment) {
    if (typeof mComment !== "object") {
        return "COMMENT UNDEFINED";
    }

    const comment = mComment.comment;
    if (typeof comment !== "object") {
        return "COMMENT OBJ UNDEFINED";
    }

    const text = comment.text;
    if (typeof text !== "string") {
        return "COMMENT TEXT NOT STRING";
    }

    if (text.length < 1) {
        return "COMMENT TEXT EMPTY";
    }

    if (text.length > MAX_COMMENT_LEN) {
        return "COMMENT TEXT TOO LONG";
    }

    // check if post createdAt is a valid date
    if (new Date(comment.createdAt).toString() === 'Invalid Date') {
        return "INVALID DATE";
    }

    // check if post is not in the future
    if (comment.createdAt > Date.now() + 10000) {
        return "FUTURE DATE";
    }

    // Check Post UUID
    const postUuid = comment.postUuid;
    if (typeof postUuid !== "string") {
        return "NO POST UUID";
    }

    // Check Reply Comment UUID
    const replyCommentUuid = comment.replyCommentUuid;
    if (replyCommentUuid != undefined && typeof replyCommentUuid !== "string") {
        return "REPLY COMMENT UUID NOT STRING";
    }

    const signature = mComment.signature;
    if (signature === undefined || typeof signature !== 'string') {
        return "SIGNATURE MISSING";
    }

    // Validate User
    const userId = mComment.userId;
    if (typeof userId !== "string") {
        return "COMMENT USER ID NOT STRING";
    }

    // Get Public Key
    const publicKey = await getPublicKeyFromUserId(userId);
    if (publicKey === undefined) {
        return "USER NOT FOUND";
    }

    // Validate User ID
    const actualUserId = await userHash(publicKey);
    if (userId !== actualUserId) {
        return "USER ID MISMATCH";
    }

    const _comment = {
        text: comment.text,
        postUuid: comment.postUuid,
        createdAt: comment.createdAt,
        replyCommentUuid: comment.replyCommentUuid,
    };

    // Validate Signature
    const verified = await verifyObj(_comment, signature, publicKey);
    if (!verified) {
        return "SIGNATURE INVALID";
    }

    return "OK";
}

export async function validateCommentSignature(commentEntry) {
    const res = await verifyComment(commentEntry);
    return {ok: res === "OK", error: res};
}

export async function transformCommentObjArr(commentObjArr) {
    let comments = [];
    for (let commentObj of commentObjArr) {
        let post = {
            uuid: commentObj.uuid,
            displayName: async () => {
                const res = await getDisplayNameFromUserId(commentObj.userId);
                if (res === undefined)
                    return undefined;
                return res;
            },
            userId: commentObj.userId,
            postUuid: commentObj.comment.postUuid,
            replyCommentUuid: commentObj.comment.replyCommentUuid,
            text: commentObj.comment.text,
            createdAt: commentObj.comment.createdAt,
            replyCount: commentObj.replyCount,
            valid: async () => {
                await sleep(getRandomIntInclusive(120, 500));
                const commentHash = await getHashFromObj(commentObj);
                const res = await validCommentSigCache.get(commentHash, async () => {
                    return await validateCommentSignature(commentObj);
                })

                // For now we dont store the invalid post signatures
                if (res == undefined || !res.ok)
                    await validCommentSigCache.delete(commentHash);
                return res;
            },
            pfpUrl: async () => {
                return await getUserPfpFromUserId(commentObj.userId);
            },
        };
        comments.push(post);
    }

    return comments;
}

export async function loadCommentByUuid(uuid) {
    let res = await getWithAuth(`/user/comment/comment/${encodeURIComponent(uuid)}`);
    if (res === undefined)
        return alert("Failed to get comment");

    const comment = await transformCommentObjArr([res]);
    if (comment === undefined)
        return alert("Failed to transform comment");

    return comment[0];
}

export async function deleteComment(uuid) {
    let res = await deleteWithAuth(`/user/comment/comment/${encodeURIComponent(uuid)}`);
    if (res === undefined)
        return false;

    return true;
}

export async function loadCommentsForPost(uuid) {
    let res = await getWithAuth(`/user/comment/post/${encodeURIComponent(uuid)}`);
    if (res === undefined)
        return alert("Failed to get comments");

    const comments = await transformCommentObjArr(res);
    if (comments === undefined)
        return alert("Failed to transform comments");

    return comments;
}

export async function loadRepliesForComment(uuid) {
    let res = await getWithAuth(`/user/comment/replies/${encodeURIComponent(uuid)}`);
    if (res === undefined)
        return alert("Failed to get comments");

    const comments = await transformCommentObjArr(res);
    if (comments === undefined)
        return alert("Failed to transform comments");

    return comments;
}

export async function loadReplyCountForComment(uuid) {
    let res = await getWithAuth(`/user/comment/reply-count/${encodeURIComponent(uuid)}`);
    if (res === undefined)
        return alert("Failed to get reply count");

    const count = res.count;
    if (count === undefined)
        return alert("Failed to get reply count");

    return count
}

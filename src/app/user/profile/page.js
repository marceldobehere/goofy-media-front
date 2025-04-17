'use client';

import styles from "./page.module.css";
import {useState} from "react";
import {GlobalStuff, useGlobalState} from "@/lib/globalStateStuff";
import {usePathname} from "next/navigation";
import EntryList from "@/app/user/home/entries/EntryList";
import PostEntry from "@/app/user/home/entries/postEntry";
import {
    loadPost,
    loadUserPosts,
    onWindowGoBack,
    postListGoToPage
} from "@/lib/post/postUtils";
import {searchButtonMenu} from "@/comp/buttonMenu";
import {goPath} from "@/lib/goPath";
import {CoolCache} from "@/lib/coolCache";
import {followUser, isUserFollowed, unfollowUser} from "@/lib/follows/followUtils";
import usefulStyles from "@/comp/useful.module.css";
import UnifiedMenu from "@/comp/unified_layout/unifiedMenu";
import {getPublicInfoForUser} from "@/lib/publicInfo/publicInfoUtils";

const followingUserCache = new CoolCache({
    localStorageKey: "IS_USER_FOLLOWED",
    maxSize: 2000,
    saveToLocalStorageFreq: 1,
    cacheEntryTimeout: 1000 * 60 * 60 * 24 * 5 // 5 days
});


let onceLoaded = undefined;
export default function Profile() {
    const pathName = usePathname();
    const pageLimit = 8;
    let [query, _setQuery] = useState({page: 0, userId: ""});
    const [postData, setPostData] = useState({posts: [], isOnLastPage: false, isOnFirstPage: true});
    const [isFollowed, setisFollowed] = useState();
    const [profileInfo, setProfileInfo] = useState({});
    const [pinnedPostObj, setPinnedPostObj] = useState();

    const setQuery = (q) => {
        _setQuery(q);
        loadPosts(q);
        if (q.page == 0)
            getPublicInfoForUser(q.userId).then(async (info) => {
                if (info !== undefined) {
                    setProfileInfo(info);
                    if (info.pinnedPostUuid !== undefined) {
                        const res = await loadPost(info.pinnedPostUuid);
                        if (res !== undefined) {
                            setPinnedPostObj(res);
                        } else
                            setPinnedPostObj(undefined);
                    }
                } else
                    setProfileInfo({})
            });
    }

    async function loadPosts(nQuery) {
        if (nQuery == undefined)
            nQuery = query;
        if (nQuery.userId === "")
            return console.log("No user id provided");
        const res = await loadUserPosts(nQuery.userId, pageLimit, nQuery.page);
        if (res === undefined)
            return alert("Failed to get posts");
        setPostData(res);
        if (onceLoaded !== undefined)
            setTimeout(onceLoaded, 150)
    }

    function goToPage(page) {
        if (page < 0)
            page = 0;

        const top = (page > query.page);

        const newQuery = {page, userId: query.userId};
        onceLoaded = postListGoToPage(newQuery, top);
        setQuery(newQuery);
    }

    useGlobalState(pathName, false, false, async () => {
        const query = new URLSearchParams(window.location.search);
        const userId = query.get("userId");
        if (userId === undefined || userId === "")
            return goPath("/user/home");

        let page = query.get("page");
        if (page === null)
            page = 0;
        else
            page = parseInt(page);
        setQuery({page: page, userId: userId});

        onWindowGoBack((query) => {
            const userId = query.get("userId");
            let page = query.get("page");
            if (page === null)
                page = 0;
            else
                page = parseInt(page);

            onceLoaded = undefined;
            const newQuery = {page, userId};
            setQuery(newQuery);
        });

        if (GlobalStuff.loggedIn) {
            await checkFollowingStatus(userId);
        }
    }, () => {

    });

    async function checkFollowingStatus(userId) {
        if (userId == undefined)
            userId = query.userId;

        const res = await followingUserCache.get(userId, async () => {
            const res = await isUserFollowed(userId);
            return res;
        });
        if (res !== undefined) {
            setisFollowed(res);
            return;
        }
    }

    async function toggleFollow() {
        if (isFollowed == undefined)
            return;
        await followingUserCache.delete(query.userId);
        if (isFollowed) {
            const res = await unfollowUser(query.userId);
            if (!res)
                alert("Failed to unfollowe user");
        } else {
            const res = await followUser(query.userId);
            if (!res)
                alert("Failed to followUser");
        }
        await checkFollowingStatus();
    }

    const profilePageData = <div>
        <div className={usefulStyles.CenterContentDiv} style={{minHeight: "200px"}}>
            <h3>Viewing Profile Info for: @{query.userId}</h3>
            <button id={"copy-post-link"} style={{float: "right"}} onClick={() => {
                const URL = `${GlobalStuff.server}/smol/user/${encodeURIComponent(query.userId)}`;
                navigator.clipboard.writeText(URL);
                const button = document.getElementById("copy-post-link");
                button.innerText = "Copied!";
                setTimeout(() => {
                    button.innerText = "Copy Smol Link";
                }, 2000);
            }}>Copy Smol Link
            </button>

            <br/>
            <div>
                <br/>
                <hr/>
                <div className={styles.MainInfo}>
                    <h3>Info</h3>
                    Display name: {profileInfo.displayName !== undefined ?
                    <b>{profileInfo.displayName}</b> : "N/A"}<br/>
                    Pronouns: {profileInfo.profilePronouns !== undefined ?
                    <b>{profileInfo.profilePronouns}</b> : "N/A"}<br/>
                </div>
                <hr/>
                <div className={styles.Bio}>
                    <h3>Bio</h3>
                    {profileInfo.profileBio !== undefined ? profileInfo.profileBio : "(The User does not have a Bio)"}
                </div>
                <hr/>
                {(profileInfo.profileLinks !== undefined && profileInfo.profileLinks.length > 0) ?
                    <>
                        <div className={styles.Links}>
                            <h3>Links</h3>
                            {profileInfo.profileLinks !== undefined ? profileInfo.profileLinks : "(No Links)"}
                        </div>
                        <hr/>
                    </> : ""}
                {profileInfo.pinnedPostUuid !== undefined ?
                    <>
                        <div className={styles.PinnedPost}>
                            <h3>Pinned Post</h3>
                            {pinnedPostObj ?
                                <PostEntry post={pinnedPostObj}></PostEntry> :
                                <p style={{textAlign: "center"}}><br/>Pinned post does not exist.</p>}
                        </div>
                        <hr/>
                    </> : ""}
            </div>

            <br/>
            <button className={styles.FollowBtn} disabled={isFollowed == undefined}
                    onClick={toggleFollow}>{isFollowed ? "Unfollow" : "Follow"}</button>
        </div>
    </div>;

    const buttonMenu = searchButtonMenu(goToPage, query.page, postData.isOnFirstPage, postData.isOnLastPage);
    return <UnifiedMenu
        divSizes={{left: "20vw", main: "60vw", right: "20vw"}}
        mainDivData={
            <div>
                <h1>Profile</h1>

                {postData.isOnFirstPage ?
                    <>
                        {profilePageData}
                        <br/><br/>
                        <h3>Showing posts from the user</h3>
                    </> :
                    <>
                        <h3>Showing posts from @{query.userId} {query.page == 0 ? (<></>) : (
                            <span> (Page {query.page})</span>)}</h3>
                        <br/>
                        {buttonMenu}<br/>
                    </>}

                <br/>

                <div className={usefulStyles.CenterContentDiv}>
                    <div className={styles.PostList}>
                        <EntryList elements={postData.posts}
                                   compFn={(post) => (<PostEntry post={post}></PostEntry>)}
                                   keyFn={(post) => (post.uuid)}></EntryList>
                    </div>
                </div>
                <br/>
                {buttonMenu}
                <br/><br/>
            </div>
        }
    />;
}

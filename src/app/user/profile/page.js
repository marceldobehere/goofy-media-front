'use client';

import styles from "./page.module.css";
import {useEffect, useState} from "react";
import {GlobalStuff, initGlobalState} from "@/lib/globalStateStuff";
import {usePathname} from "next/navigation";
import MainFooter from "@/comp/mainFooter";
import EntryList from "@/app/user/home/entries/EntryList";
import PostEntry from "@/app/user/home/entries/postEntry";
import {
    loadNewsPosts,
    loadUserPosts,
    onWindowGoBack,
    postListGoToPage,
    transformPostObjArr
} from "@/lib/post/postUtils";
import {searchButtonMenu} from "@/comp/buttonMenu";
import {goPath} from "@/lib/goPath";

let onceLoaded = undefined;
export default function Profile() {
    const pathName = usePathname();
    const pageLimit = 5;
    let [query, _setQuery] = useState({page: 0, userId: ""});
    const [postData, setPostData] = useState({posts: [], isOnLastPage: false, isOnFirstPage: true});
    const setQuery = (q) => {
        _setQuery(q);
        loadPosts(q);
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

    useEffect(() => {
        initGlobalState(pathName, false, false, async () => {

        });

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
    }, []);

    const profilePageData = <div>
        <div className={styles.PostDiv} style={{minHeight: "200px"}}>
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
            <p>
                This is some amazing profile info for this user.<br/>
                They are a very interesting person.<br/>
                They have a lot of interesting things to say.<br/>
                They are very cool.<br/>
                <br/>
                Look at all these cool posts they have made.
            </p>
        </div>
    </div>;

    const buttonMenu = searchButtonMenu(goToPage, query.page, postData.isOnFirstPage, postData.isOnLastPage);
    return (
        <div>
            <main className={styles.main}>
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

                <div className={styles.PostDiv}>
                    <EntryList elements={postData.posts}
                               compFn={(post) => (<PostEntry post={post}></PostEntry>)} keyFn={(post) => (post.uuid)}></EntryList>
                </div>
                <br/>
                {buttonMenu}
                <br/><br/>
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

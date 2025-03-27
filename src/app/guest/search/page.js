'use client';

import styles from "./page.module.css";
import {useEffect, useState} from "react";
import {initGlobalState} from "@/lib/globalStateStuff";
import {usePathname} from "next/navigation";
import MainFooter from "@/comp/mainFooter";
import EntryList from "@/app/user/home/entries/EntryList";
import PostEntry from "@/app/user/home/entries/postEntry";
import {goPath} from "@/lib/goPath";
import {
    loadSearchPosts,
    onWindowGoBack,
    postListGoToPage
} from "@/lib/post/postUtils";
import {searchButtonMenu} from "@/comp/buttonMenu";

let onceLoaded = undefined;
export default function Search() {
    const pathName = usePathname();
    const pageLimit = 5;
    const [query, setQuery] = useState({tag: "", page: 0});
    const [postData, setPostData] = useState({posts: undefined, isOnLastPage: false, isOnFirstPage: true});

    async function loadPosts() {
        const tag = query.tag;
        if (tag == undefined || tag === "")
            return;

        const res = await loadSearchPosts(tag, pageLimit, query.page);
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
        const newQuery = {tag: query.tag, page: page};
        onceLoaded = postListGoToPage(newQuery, top);
        setQuery(newQuery);
    }

    useEffect(() => {
        initGlobalState(pathName, false, false, async () => {

        });

        const query = new URLSearchParams(window.location.search);
        console.log("> Search: ", window.location.search)
        console.log("> Query: ", query)
        const tag = query.get("tag");
        console.log("> Tag: ", tag);
        let page = query.get("page");
        if (page === null)
            page = 0;
        else
            page = parseInt(page);
        setQuery({tag: tag, page: page});

        onWindowGoBack((query) => {
            const tag = query.get("tag");
            let page = query.get("page");
            if (page === null)
                page = 0;
            else
                page = parseInt(page);

            onceLoaded = undefined;
            setQuery({tag, page});
        });
    }, []);

    useEffect(() => {
        loadPosts();
    }, [query]);

    const buttonMenu = searchButtonMenu(goToPage, query.page, postData.isOnFirstPage, postData.isOnLastPage);

    const mainContent = (query.tag != undefined) ? (
        <>
            <h1>Search</h1>

            <h3>Showing post with tag #{query.tag} {query.page == 0 ? (<></>) : (
                <span> (Page {query.page})</span>)}</h3>
            <br/>

            {buttonMenu}
            <br/><br/>

            <div className={styles.PostDiv}>
                {(postData.posts == undefined) ?
                    <div style={{height: "200px"}}></div> : (
                        (postData.posts.length === 0) ? (
                            <div style={{height: "200px"}}><h3>No posts found.</h3></div>) : (
                            <EntryList elements={postData.posts}
                                       compFn={(post) => (<PostEntry post={post}></PostEntry>)}></EntryList>)
                    )}
            </div>
            <br/>
            {buttonMenu}
            <br/><br/>
        </>) : (
        <>
            <h1>Search</h1>

            <div className={styles.PostDiv}>
                <div style={{width: "250px", margin: "auto"}}>
                    <label>Enter Search Tag:</label><br/>
                    <input id={"tag-input"} type={"text"}
                           onKeyUp={(e) => {
                               if (e.key === 'Enter') {
                                   const tagVal = document.getElementById("tag-input").value;
                                   goPath(`/guest/search?tag=${tagVal}`);
                               }
                           }}></input>&nbsp;&nbsp;
                    <button onClick={() => {
                        const tagVal = document.getElementById("tag-input").value;
                        goPath(`/guest/search?tag=${tagVal}`);
                    }}>Search
                    </button>
                    <br/>
                </div>
            </div>
        </>
    );

    return (
        <div>
            <main className={styles.main}>
                {mainContent}
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

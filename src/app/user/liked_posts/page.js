'use client';

import {usePathname} from "next/navigation";
import {loadNewsPosts, onWindowGoBack, postListGoToPage} from "@/lib/post/postUtils";
import {initGlobalState} from "@/lib/globalStateStuff";
import {searchButtonMenu} from "@/comp/buttonMenu";
import styles from "@/app/guest/news/page.module.css";
import EntryList from "@/app/user/home/entries/EntryList";
import MainFooter from "@/comp/mainFooter";
import {useEffect, useState} from "react";
import {getLikedPosts} from "@/lib/likes/likeUtils";
import PostEntry from "@/app/user/home/entries/postEntry";


let onceLoaded = undefined;
export default function LikedPosts() {
    const pathName = usePathname();
    const pageLimit = 15;
    const [query, _setQuery] = useState({page: 0});
    const [likeData, setLikeData] = useState({likes: [], isOnLastPage: true, isOnFirstPage: true});
    const setQuery = (q) => {
        _setQuery(q);
        loadLikedPosts(q);
    }

    async function loadLikedPosts(nQuery) {
        if (nQuery == undefined)
            nQuery = query;

        const res = await getLikedPosts(pageLimit, nQuery.page);
        console.log(res);
        if (res === undefined)
            return alert("Failed to get liked posts");
        setLikeData(res);
        if (onceLoaded !== undefined)
            setTimeout(onceLoaded, 150)
    }

    function goToPage(page) {
        if (page < 0)
            page = 0;

        const top = (page > query.page);

        onceLoaded = postListGoToPage({page}, top);
        setQuery({page});
    }

    useEffect(() => {
        initGlobalState(pathName, true, false, async () => {
            const query = new URLSearchParams(window.location.search);
            let page = query.get("page");
            if (page === null)
                page = 0;
            else
                page = parseInt(page);
            setQuery({page: page});
        });

        onWindowGoBack((query) => {
            let page = query.get("page");
            if (page === null)
                page = 0;
            else
                page = parseInt(page);

            onceLoaded = undefined;
            setQuery({page});
        });
    }, []);

    const buttonMenu = searchButtonMenu(goToPage, query.page, likeData.isOnFirstPage, likeData.isOnLastPage);
    return (
        <div>
            <main className={styles.main}>
                <h1>Liked Posts</h1>

                <h3>Showing liked Posts {query.page == 0 ? (<></>) : (<span> (Page {query.page})</span>)}</h3>
                <br/>

                {buttonMenu}
                <br/>
                <div style={{width: "max-content", margin: "auto"}}>
                    <button onClick={async () => {
                        loadLikedPosts({page: query.page})
                    }}>Refresh
                    </button>
                </div>
                <br/>

                <div className={styles.PostDiv}>
                    <EntryList elements={likeData.likes}
                               compFn={(post) => (
                                   <PostEntry post={post}></PostEntry>)}
                               keyFn={(post) => (post.uuid)}></EntryList>
                    {likeData.likes.length == 0 ? <h3>No Liked Posts</h3> : ""}
                </div>
                <br/>
                {buttonMenu}
                <br/><br/>
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}
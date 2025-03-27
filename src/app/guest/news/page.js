'use client';

import styles from "./page.module.css";
import {useEffect, useState} from "react";
import {initGlobalState} from "@/lib/globalStateStuff";
import {usePathname} from "next/navigation";
import MainFooter from "@/comp/mainFooter";
import EntryList from "@/app/user/home/entries/EntryList";
import PostEntry from "@/app/user/home/entries/postEntry";
import {loadNewsPosts, onWindowGoBack, postListGoToPage, transformPostObjArr} from "@/lib/post/postUtils";
import {searchButtonMenu} from "@/comp/buttonMenu";

let onceLoaded = undefined;
export default function News() {
    const pathName = usePathname();
    const pageLimit = 5;
    const [query, setQuery] = useState({page: 0});
    const [postData, setPostData] = useState({posts: [], isOnLastPage: false, isOnFirstPage: true});


    async function loadPosts() {
        const res = await loadNewsPosts(pageLimit, query.page);
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

        onceLoaded = postListGoToPage({page}, top);
        setQuery({page});
    }

    useEffect(() => {
        initGlobalState(pathName, false, false, async () => {

        });

        const query = new URLSearchParams(window.location.search);
        let page = query.get("page");
        if (page === null)
            page = 0;
        else
            page = parseInt(page);
        setQuery({page: page});

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

    useEffect(() => {
        loadPosts();
    }, [query]);

    const buttonMenu = searchButtonMenu(goToPage, query.page, postData.isOnFirstPage, postData.isOnLastPage);
    return (
        <div>
            <main className={styles.main}>
                <h1>News</h1>

                <h3>Showing news {query.page == 0 ? (<></>) : (<span> (Page {query.page})</span>)}</h3>
                <br/>

                {buttonMenu}
                <br/><br/>

                <div className={styles.PostDiv}>
                    <EntryList elements={postData.posts}
                               compFn={(post) => (<PostEntry post={post}></PostEntry>)}></EntryList>
                </div>
                <br/>
                {buttonMenu}
                <br/><br/>
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

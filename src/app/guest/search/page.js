'use client';

import styles from "./page.module.css";
import Link from "next/link";
import {useEffect, useState} from "react";
import {initGlobalState} from "@/lib/globalStateStuff";
import {usePathname} from "next/navigation";
import MainFooter from "@/comp/mainFooter";
import NewsEntry from "@/app/user/home/entries/newsEntry";
import EntryList from "@/app/user/home/entries/EntryList";
import {getWithAuth} from "@/lib/req";
import {transformPostObjArr} from "@/app/user/home/postTools";
import PostEntry from "@/app/user/home/entries/postEntry";
import {goPath} from "@/lib/goPath";

export default function Search() {
    const pathName = usePathname();
    const [postArr, setPostArr] = useState([]);
    const [query, setQuery] = useState({tag: "", page: 0});
    const [lastPage, setLastPage] = useState(false);
    const [firstPage, setFirstPage] = useState(true);
    const pageLimit = 5;

    async function loadPosts() {
        // if (postArr.length !== 0)
        //     return console.log("> Posts already loaded: ", postArr);

        let url = undefined;
        if (query.tag)
            url = `/user/post/tag/${query.tag}`;

        if (url === undefined)
            return console.log("No tag to search for");

        console.log("> Loading posts");
        let res = await getWithAuth(url, {"query-limit": pageLimit + 1, "query-start": query.page * pageLimit});
        if (res === undefined)
            return alert("Failed to get posts");

        const postArr = await transformPostObjArr(res);
        setLastPage(postArr.length < pageLimit + 1);
        setFirstPage(query.page === 0);
        if (postArr.length > pageLimit)
            postArr.pop();

        setPostArr(postArr);
    }

    function goToPage(page, newerQuery) {
        if (page < 0)
            page = 0;

        const newQuery = (newerQuery === undefined) ? {...query, page: page} : newerQuery;
        console.log("> New query: ", newQuery);

        // set query params in url
        const searchParams = new URLSearchParams();
        searchParams.set("tag", newQuery.tag);
        searchParams.set("page", newQuery.page);
        window.history.pushState({}, "", `${window.location.pathname}?${searchParams}`);
        setQuery(newQuery);

        // scroll up
        window.scrollTo(0, 0);
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
    }, []);

    useEffect(() => {
        loadPosts();
    }, [query]);

    const buttonMenu = (
        <div style={{margin: "auto", textAlign: "center"}}>
            <button onClick={() => {
                goToPage(query.page - 1)
            }} disabled={firstPage}>&lt;- Back
            </button>
            &nbsp;&nbsp;
            <Link href={"/user/home"}>Home</Link>
            &nbsp;&nbsp;
            <button onClick={() => {
                goToPage(query.page + 1)
            }} disabled={lastPage}>Next -&gt;
            </button>
        </div>
    );

    const mainContent = (query.tag != undefined) ? (
        <>
            <h1>Search</h1>

            <h3>Showing post with tag #{query.tag} {query.page == 0 ? (<></>) : (
                <span> (Page {query.page})</span>)}</h3>
            <br/>

            {buttonMenu}
            <br/><br/>

            <div className={styles.PostDiv}>
                {(postArr.length === 0) ? (<div style={{height: "200px"}}><h3>No posts found.</h3></div>) : (
                    <EntryList elements={postArr}
                               compFn={(post) => (<PostEntry post={post}></PostEntry>)}></EntryList>)}
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

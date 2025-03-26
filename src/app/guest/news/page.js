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

export default function Search() {
    const pathName = usePathname();
    const [postArr, setPostArr] = useState([]);
    const [query, setQuery] = useState({page: 0});
    const [lastPage, setLastPage] = useState(false);
    const [firstPage, setFirstPage] = useState(true);
    const pageLimit = 5;

    async function loadPosts() {
        // if (postArr.length !== 0)
        //     return console.log("> Posts already loaded: ", postArr);

        console.log("> Loading posts");
        let res = await getWithAuth("/user/post/news", {"query-limit": pageLimit + 1, "query-start": query.page * pageLimit});
        if (res === undefined)
            return alert("Failed to get posts");

        const postArr = await transformPostObjArr(res);
        setLastPage(postArr.length < pageLimit + 1);
        setFirstPage(query.page === 0);
        if (postArr.length > pageLimit)
            postArr.pop();

        setPostArr(postArr);
    }

    function goToPage(page) {
        if (page < 0)
            page = 0;
        const newQuery = {...query, page: page};
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
        let page = query.get("page");
        if (page === null)
            page = 0;
        else
            page = parseInt(page);
        setQuery({page: page});
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

    return (
        <div>
            <main className={styles.main}>
                <h1>News</h1>

                <h3>Showing news {query.page == 0 ? (<></>) : (<span> (Page {query.page})</span>)}</h3>
                <br/>

                {buttonMenu}
                <br/><br/>

                <div className={styles.PostDiv}>
                    <EntryList elements={postArr} compFn={(post) => (<PostEntry post={post}></PostEntry>)}></EntryList>
                </div>
                <br/>
                {buttonMenu}
                <br/><br/>
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

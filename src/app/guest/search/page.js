'use client';

import styles from "./page.module.css";
import {useRef, useState} from "react";
import {useGlobalState} from "@/lib/globalStateStuff";
import {usePathname} from "next/navigation";
import EntryList from "@/app/user/home/entries/EntryList";
import PostEntry from "@/app/user/home/entries/postEntry";
import {goPath} from "@/lib/goPath";
import {
    getSimilarTags, loadGlobalPosts, loadSearchGlobalPosts,
    loadSearchPosts,
    onWindowGoBack,
    postListGoToPage
} from "@/lib/post/postUtils";
import {searchButtonMenu} from "@/comp/buttonMenu";
import usefulStyles from "@/comp/useful.module.css";
import UnifiedMenu from "@/comp/unified_layout/unifiedMenu";
import {getSimilarUsers} from "@/lib/publicInfo/publicInfoUtils";
import {getProfileUrl, getSearchWithTagUrl} from "@/lib/publicInfo/links";

let onceLoaded = undefined;
export default function Search() {
    const pathName = usePathname();
    const pageLimit = 5;
    const [searchText, setSearchText] = useState({search: "", resTags: [], resUsers: []});
    const [query, _setQuery] = useState({tag: "", page: 0});
    const [postData, setPostData] = useState({posts: undefined, isOnLastPage: true, isOnFirstPage: true});
    const timeoutId = useRef(undefined);

    const setQuery = (q) => {
        _setQuery(q);
        loadPosts(q);
    }

    async function loadPosts(nQuery) {
        if (nQuery == undefined)
            nQuery = query;

        const tag = nQuery.tag;
        if (tag == undefined || tag === "")
            return;

        const res = (tag == "global") ? (await loadSearchGlobalPosts(pageLimit * 2, nQuery.page)) : (await loadSearchPosts(tag, pageLimit, nQuery.page));
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

    useGlobalState(pathName, false, false, async () => {
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
    }, () => {
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
    });

    const buttonMenu = searchButtonMenu(goToPage, query.page, postData.isOnFirstPage, postData.isOnLastPage);
    const mainContent = (query.tag != undefined) ? (
        <>
            <h1>Search</h1>

            <h3>{(query.tag == "global") ? "Showing the global feed" : `Showing posts with the tag #${query.tag}`} {query.page == 0 ? (<></>) : (
                <span> (Page {query.page})</span>)}</h3>
            <br/>

            {buttonMenu}
            <br/><br/>

            <div className={usefulStyles.CenterContentDiv}>
                {(postData.posts == undefined) ?
                    <div style={{height: "200px"}}></div> : (
                        (postData.posts.length === 0) ? (
                            <div style={{height: "200px"}}><h3>No posts found.</h3></div>) : (
                            <EntryList elements={postData.posts}
                                       compFn={(post) => (<PostEntry post={post}></PostEntry>)}
                                       keyFn={(post) => (post.uuid)}></EntryList>)
                    )}
            </div>
            <br/>
            {buttonMenu}
            <br/><br/>
        </>) : (
        <>
            <h1>Search</h1>

            <div className={usefulStyles.CenterContentDiv}>
                <div style={{width: "85%", margin: "auto"}}>
                    <label className={styles.SearchLabel}>Enter Query: (Tag / User)</label>
                    <input className={styles.SearchInput} id={"tag-input"} type={"text"} value={searchText.search}
                           onChange={async (e) => {
                               const tagVal = e.target.value;
                               setSearchText({
                                   search: tagVal,
                                   resTags: searchText.resTags,
                                   resUsers: searchText.resUsers
                               });

                               const timeOutId = setTimeout(async () => {
                                   const tProm = getSimilarTags(tagVal);
                                   const uProm = getSimilarUsers(tagVal);

                                   const tags = await tProm;
                                   const users = await uProm;

                                   // console.log(tags, users)
                                   setSearchText((prevState) => {
                                       if (prevState == undefined || prevState.search == tagVal) {
                                           return {search: tagVal, resTags: tags, resUsers: users};
                                       }
                                       return prevState;
                                   })
                               }, 100);
                               if (timeoutId.current !== undefined)
                                   clearTimeout(timeoutId.current);
                               timeoutId.current = timeOutId;
                           }}
                           onKeyUp={async (e) => {
                               if (e.key === 'Enter') {
                                   goPath(`/guest/search?tag=${encodeURIComponent(searchText.search)}`);
                                   return;
                               }
                           }}></input>
                    <button className={styles.SearchButton} onClick={() => {
                        goPath(`/guest/search?tag=${encodeURIComponent(searchText.search)}`);
                    }}>Search
                    </button>
                    <br/>
                    <h3 className={styles.SearchLabel}>Tags:</h3>
                    <div className={styles.SearchResBox}>
                        <ul>
                            {searchText.resTags.map((tag, idx) => (
                                <li key={idx}>
                                    <div key={idx} className={styles.TagDiv}>
                                        <a href={getSearchWithTagUrl(tag.tag)}>#{tag.tag}</a> ({tag.count})
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <h3 className={styles.SearchLabel}>Users:</h3>
                    <div className={styles.SearchResBox}>
                        <ul>
                            {searchText.resUsers.map((userEntry, idx) => (
                                <li key={idx}>
                                    <div key={idx} className={styles.LinkDiv}>
                                        <a href={getProfileUrl(userEntry.userId)}>
                                            {userEntry.displayName} <span>({userEntry.userId})</span>
                                        </a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );

    return <UnifiedMenu
        divSizes={{left: "20vw", main: "60vw", right: "20vw"}}
        mainDivData={mainContent}></UnifiedMenu>;
}

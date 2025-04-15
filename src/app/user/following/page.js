'use client';

import {usePathname} from "next/navigation";
import {onWindowGoBack, postListGoToPage} from "@/lib/post/postUtils";
import {GlobalStuff, initGlobalState} from "@/lib/globalStateStuff";
import {searchButtonMenu} from "@/comp/buttonMenu";
import styles from "@/app/user/following/page.module.css";
import EntryList from "@/app/user/home/entries/EntryList";
import MainFooter from "@/comp/mainFooter";
import {useEffect, useState} from "react";
import {getFollowing} from "@/lib/follows/followUtils";
import {basePath} from "@/lib/goPath";
import Link from "next/link";
import usefulStyles from "@/comp/useful.module.css";


let onceLoaded = undefined;
export default function Following() {
    const pathName = usePathname();
    const pageLimit = 15;
    const [query, _setQuery] = useState({page: 0});
    const [notifData, setNotifData] = useState({following: [], isOnLastPage: true, isOnFirstPage: true});
    const setQuery = (q) => {
        _setQuery(q);
        loadFollowing(q);
    }

    async function loadFollowing(nQuery) {
        if (nQuery == undefined)
            nQuery = query;

        const res = await getFollowing(pageLimit, nQuery.page);
        console.log(res);
        if (res === undefined)
            return alert("Failed to get notifications");
        setNotifData(res);
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

    const buttonMenu = searchButtonMenu(goToPage, query.page, notifData.isOnFirstPage, notifData.isOnLastPage);
    return (
        <div>
            <main className={styles.main}>
                <h1>Following</h1>

                <h3>Showing users you follow {query.page == 0 ? (<></>) : (<span> (Page {query.page})</span>)}</h3>
                <br/>

                {/*{buttonMenu}*/}
                <br/>
                <div style={{width: "max-content", margin: "auto"}}>
                    <button onClick={async () => {
                        loadFollowing({page: query.page})
                    }}>Refresh
                    </button>&nbsp;&nbsp;
                    <Link href={"/user/home"}>Home</Link>
                </div>
                <br/>

                <div className={usefulStyles.CenterContentDiv}>
                    <EntryList elements={notifData.following}
                               compFn={(followUserId) => (
                                   <div className={styles.UserEntry}>
                                       <a href={`${basePath}/user/profile?userId=${encodeURIComponent(followUserId)}&serverId=${encodeURIComponent(GlobalStuff.server)}`}
                                          target={"_blank"}>@{followUserId}</a>
                                   </div>)}
                               keyFn={(followUserId) => (followUserId)}></EntryList>
                    {notifData.following.length == 0 ? <h3>No users found</h3> : ""}
                </div>
                <br/>
                {/*{buttonMenu}*/}
                <br/><br/>
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}
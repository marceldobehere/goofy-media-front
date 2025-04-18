'use client';

import {usePathname} from "next/navigation";
import {onWindowGoBack, postListGoToPage} from "@/lib/post/postUtils";
import {useGlobalState} from "@/lib/globalStateStuff";
import {searchButtonMenu} from "@/comp/buttonMenu";
import styles from "@/app/user/followers/page.module.css";
import EntryList from "@/app/user/home/entries/EntryList";
import {useState} from "react";
import {getFollowers, getFollowing} from "@/lib/follows/followUtils";
import usefulStyles from "@/comp/useful.module.css";
import UnifiedMenu from "@/comp/unified_layout/unifiedMenu";
import UserEntry from "@/app/user/followers/entries/userEntry";


let onceLoaded = undefined;
export default function Followers() {
    const pathName = usePathname();
    const pageLimit = 15;
    const [query, _setQuery] = useState({page: 0});
    const [notifData, setNotifData] = useState({followers: [], isOnLastPage: true, isOnFirstPage: true});
    const setQuery = (q) => {
        _setQuery(q);
        loadFollowing(q);
    }

    async function loadFollowing(nQuery) {
        if (nQuery == undefined)
            nQuery = query;

        const res = await getFollowers(pageLimit, nQuery.page);
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

    useGlobalState(pathName, true, false, async () => {
        const query = new URLSearchParams(window.location.search);
        let page = query.get("page");
        if (page === null)
            page = 0;
        else
            page = parseInt(page);
        setQuery({page: page});
    }, () => {
        onWindowGoBack((query) => {
            let page = query.get("page");
            if (page === null)
                page = 0;
            else
                page = parseInt(page);

            onceLoaded = undefined;
            setQuery({page});
        });
    });

    const buttonMenu = searchButtonMenu(goToPage, query.page, notifData.isOnFirstPage, notifData.isOnLastPage);
    return <UnifiedMenu
        divSizes={{left: "20vw", main: "60vw", right: "20vw"}}
        mainDivData={
            <div>
                <h1>Followers</h1>

                <h3>Showing users following you {query.page == 0 ? (<></>) : (<span> (Page {query.page})</span>)}</h3>
                <br/>

                {buttonMenu}
                <br/>
                <div style={{width: "max-content", margin: "auto"}}>
                    <button onClick={async () => {
                        loadFollowing({page: query.page})
                    }}>Refresh
                    </button>
                </div>
                <br/>

                <div className={usefulStyles.CenterContentDiv}>
                    <EntryList elements={notifData.followers}
                               compFn={(follower) => (<UserEntry userEntry={{...follower, extraText: `followed you on the ${(new Date(follower.followedAt)).toLocaleDateString()}`}}/>)}
                               keyFn={(followUserId) => (followUserId.userId)}></EntryList>
                    {notifData.followers.length == 0 ? <h3>No users found</h3> : ""}
                </div>
                <br/>
                {buttonMenu}
                <br/><br/>
            </div>
        }
    />;
}
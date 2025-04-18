'use client';

import {usePathname} from "next/navigation";
import {loadNewsPosts, onWindowGoBack, postListGoToPage} from "@/lib/post/postUtils";
import {initGlobalState, useGlobalState} from "@/lib/globalStateStuff";
import {searchButtonMenu} from "@/comp/buttonMenu";
import styles from "./page.module.css";"./page.module.css";
import EntryList from "@/app/user/home/entries/EntryList";
import {useEffect, useState} from "react";
import NotificationEntry from "@/app/user/notifications/entries/notificationEntry";
import {getNotifications, markAllNotificationsAsRead} from "@/lib/notifications/notificationUtils";
import usefulStyles from "@/comp/useful.module.css";
import UnifiedMenu from "@/comp/unified_layout/unifiedMenu";
import {refreshPage} from "@/lib/goPath";


let onceLoaded = undefined;
export default function Notifications() {
    const pathName = usePathname();
    const pageLimit = 15;
    const [query, _setQuery] = useState({page: 0});
    const [notifData, setNotifData] = useState({notifications: [], isOnLastPage: true, isOnFirstPage: true});
    const setQuery = (q) => {
        _setQuery(q);
        loadNotifications(q);
    }

    async function loadNotifications(nQuery) {
        if (nQuery == undefined)
            nQuery = query;

        const res = await getNotifications(pageLimit, nQuery.page);
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
                <h1>Notifications</h1>

                <h3>Showing Notifications {query.page == 0 ? (<></>) : (<span> (Page {query.page})</span>)}</h3>
                <br/>

                {buttonMenu}
                <br/>
                <div style={{width: "max-content", margin: "auto"}}>
                    <button onClick={async () => {
                        if (!await markAllNotificationsAsRead())
                            return alert("Failed to mark notifications as read");
                        refreshPage();
                    }}>Mark all as read
                    </button>
                    &nbsp;&#32;&nbsp;
                    <button onClick={async () => {
                        loadNotifications({page: query.page})
                    }}>Refresh
                    </button>
                </div>
                <br/>

                <div className={usefulStyles.CenterContentDiv}>
                    <EntryList elements={notifData.notifications}
                               compFn={(notification) => (
                                   <NotificationEntry notification={notification}></NotificationEntry>)}
                               keyFn={(not) => (not.uuid)}></EntryList>
                    {notifData.notifications.length == 0 ? <h3>No Notifications</h3> : ""}
                </div>
                <br/>
                {buttonMenu}
                <br/><br/>
            </div>
        }/>;
}
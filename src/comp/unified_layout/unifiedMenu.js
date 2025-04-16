'use client';

import styles from "./unifiedMenu.module.css";
import MainFooter from "@/comp/mainFooter";
import Link from "next/link";
import {GlobalStuff, logout, useGlobalState} from "@/lib/globalStateStuff";
import {basePath, goPath} from "@/lib/goPath";
import {useState} from "react";
import {usePathname} from "next/navigation";
import {getUnreadNotificationCount} from "@/lib/notifications/notificationUtils";
import {useInterval} from "@/comp/unified_layout/userInterval";

export default function UnifiedMenu({mainDivData, rightDivData, divSizes}) {
    // divSizes = {left: "20vw", main: "60vw", right: "20vw"}
    let customStyles = {};
    if (divSizes !== undefined) {
        customStyles["--left-size"] = divSizes.left;
        customStyles["--center-size"] = divSizes.main;
        customStyles["--right-size"] = divSizes.right;
    }

    if (rightDivData == undefined)
        rightDivData = "";
    if (mainDivData == undefined)
        mainDivData = "";

    const pathName = usePathname();
    const [mobileDevice, setMobileDevice] = useState();
    const [showBurgerMenu, setBurger] = useState(false);
    const [admin, setAdmin] = useState(false);
    const [notifCount, setNotifCount] = useState();

    function checkSizes() {
        const mobile = window.getComputedStyle(document.documentElement).getPropertyValue('--show_hamburg') === '1';
        setMobileDevice(mobile);

        if (showBurgerMenu && !mobile) {
            setBurger(false);
        }
    }

    if (typeof window != "undefined") {
        window.onLoad = checkSizes;
        window.onresize = checkSizes;
    }

    async function loadNotifs(poll) {
        if (!GlobalStuff.loggedIn)
            return setNotifCount(0);
        const count = await getUnreadNotificationCount();
        if (count === undefined) {
            if (!poll)
                alert("Failed to get notifications");
            return;
        }
        if (typeof document !== "undefined") {
            if (count > 0)
                document.title = `Goofy Media (${notifCount})`;
            else
                document.title = "Goofy Media";
        }
        setNotifCount(count);
    }

    useInterval(() => {
        loadNotifs(true).then();
    }, 20000);

    useGlobalState(pathName, false, false, async () => {
        setAdmin(GlobalStuff.admin);
        if (GlobalStuff.loggedIn)
            loadNotifs().then();
    }, checkSizes);

    const isHome = (typeof window !== "undefined") ? window.location.href.includes("/home") : false;

    const btnCol = notifCount > 0 ? "orange" : "white";
    const navLinks = <p>
        {(GlobalStuff.loggedIn) ? <>
            <Link
                href={"/user/notifications"}
                style={{color: btnCol}}>Notifications {((notifCount == undefined || notifCount == 0) ? "" : `(${notifCount})`)}</Link>
        </> : ""}
        {isHome ? <a href={"https://github.com/marceldobehere/goofy-media-front"} target={"_blank"}>Github Repo</a> : <Link href={"/user/home"}>Home</Link>}
        <Link href={"/guest/search?tag=global"}>Global Feed</Link>
        {(GlobalStuff.loggedIn) ? (<>
            <a onClick={async () => {
                if (confirm("Are you sure?")) {
                    await logout();
                    goPath("/guest/login")
                }
            }}>Logout</a>
        </>) : (<>
            <a onClick={async () => {
                goPath("/guest/login")
            }}>Login</a>
        </>)}
        <Link href={"/guest/news"}>News</Link>
        <a href={`${basePath}/guest/search`}>Search</a>
        {(GlobalStuff.loggedIn) ? <><Link href={"/user/following"}>Following</Link></> : ""}
        {(GlobalStuff.loggedIn) ? <><Link href={"/user/followers"}>Followers</Link></> : ""}
        {(GlobalStuff.loggedIn) ? <><Link href={"/user/liked_posts"}>Liked Posts</Link></> : ""}
        <Link href={"/user/account_settings"}>Local Settings</Link>
        {(GlobalStuff.loggedIn) ? <><Link href={`/user/profile?userId=${encodeURIComponent(GlobalStuff.userId)}`}>View Profile</Link></> : ""}
        {(GlobalStuff.loggedIn) ? <><Link href={"/user/public_info_settings"}>Public Info Settings</Link></> : ""}
        {(GlobalStuff.loggedIn) ? <><Link href={"/user/post_composer"}>Post Composer</Link></> : ""}
        {admin ? (<><Link href={"/admin/dashboard"}>Admin Dashboard</Link></>) : (<></>)}
    </p>;

    const hamburger = <div>
        <svg viewBox="0 0 120 80" width="2rem" height="2rem" fill={btnCol}>
            <rect y="10" x="20" width="80" height="10"></rect>
            <rect y="40" x="20" width="80" height="10"></rect>
            <rect y="70" x="20" width="80" height="10"></rect>
        </svg>
    </div>;

    const navContent = mobileDevice ?
        <div className={styles.LeftNavDivMobile}>
            <div className={styles.LeftNavDivMobileHeader}>
                <button onClick={() => {
                    setBurger(!showBurgerMenu);
                }}>
                    {showBurgerMenu ?
                        <div style={{transform: "rotateZ(90deg)"}}>{hamburger}</div> :
                        <div>{hamburger}</div>}
                </button>
                <h2 className={styles.NavMobileHeader}><a href={"#top"}>Goofy Media</a></h2>
                <span></span>
            </div>
            {showBurgerMenu ? <div className={styles.LeftNavDivMobileBody}>
                {navLinks}
            </div> : <></>}
        </div> : <div className={styles.LeftNavDivDesktop}>
            <h2>Navigation</h2>
            {navLinks}
        </div>;

    const leftNavDiv = <div className={styles.LeftNavDiv}>
        {mobileDevice != undefined ? navContent : ""}
    </div>;

    const mainDiv = <div className={styles.MainDiv}>
        {mainDivData}
    </div>;

    const rightDiv = <div className={styles.RightDiv}>
        {rightDivData}
    </div>;

    return (<div>
        <div className={styles.MainPageMenu} style={customStyles}>
            {leftNavDiv}
            <div className={styles.MainDivContainer}>
                {mainDiv}
                {rightDiv}
            </div>
        </div>
        <MainFooter></MainFooter>
    </div>);
}
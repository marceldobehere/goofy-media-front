'use client';

import styles from "./userEntry.module.css";
import {useState} from "react";
import {basePath} from "@/lib/goPath";
import {GlobalStuff, useGlobalState} from "@/lib/globalStateStuff";
import {usePathname} from "next/navigation";
import {getDisplayNameFromUserId, getUserPfpFromUserId} from "@/lib/publicInfo/publicInfoUtils";
import {getProfileUrl} from "@/lib/publicInfo/links";

export default function UserEntry({userEntry}) {
    const pathName = usePathname();
    const [displayName, setDisplayName] = useState();
    const [pfpUrl, setPfpUrl] = useState();

    useGlobalState(pathName, false, false, async () => {
        setDisplayName(await getDisplayNameFromUserId(userEntry.userId));
        setPfpUrl(await getUserPfpFromUserId(userEntry.userId));
    });

    const userText = displayName ? <span>{displayName} <span className={styles.UserIdLink}>(@{userEntry.userId})</span></span> : `@${userEntry.userId}`;

    return <div className={styles.UserEntry}>
        <img alt={"Profile Picture"} src={pfpUrl ? pfpUrl : "/goofy-media-front/unknown_user.png"}></img>
        <span>
            {userEntry.extraTextPre ? <span>{userEntry.extraTextPre} </span> : <></>}
            <a className={styles.UserLink}
               href={getProfileUrl(userEntry.userId)}
               target={"_blank"}>{userText}</a>
            {userEntry.extraText ? <span> {userEntry.extraText}</span> : <></>}
        </span>
    </div>;
}
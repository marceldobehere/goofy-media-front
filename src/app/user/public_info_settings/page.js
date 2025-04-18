'use client';

import styles from "./page.module.css";
import {GlobalStuff, logout, LsReset, useGlobalState} from "@/lib/globalStateStuff";
import {goPath} from "@/lib/goPath";
import {useState} from "react";
import {usePathname} from "next/navigation";
import UnifiedMenu from "@/comp/unified_layout/unifiedMenu";
import {getPublicInfoForUser, setPublicInfo, uploadMediaToServer} from "@/lib/publicInfo/publicInfoUtils";

export default function Home() {
    const pathName = usePathname();
    const [userId, setUsername] = useState("Loading...");
    const [displayName, setDisplayName] = useState("Loading...");
    const [profileBio, setProfileBio] = useState("Loading...");
    const [profilePronouns, setProfilePronouns] = useState("Loading...");
    const [profileLinks, setProfileLinks] = useState("Loading...");
    const [profileCustomCSS, setProfileCustomCSS] = useState("Loading...");
    const [profilePictureUrl, setProfilePictureUrl] = useState(undefined);
    const [profileBannerUrl, setProfileBannerUrl] = useState(undefined);
    const [pinnedPostUuid, setPinnedPostUuid] = useState(undefined);

    useGlobalState(pathName, true, false, async () => {
        if (!GlobalStuff.loggedIn) {
            goPath("/guest/login");
        }

        setUsername(GlobalStuff.userId);

        let publicInfo = await getPublicInfoForUser(GlobalStuff.userId);
        if (publicInfo == undefined)
            publicInfo = {};
        console.log(publicInfo);

        setDisplayName(publicInfo.displayName || "");
        setProfileBio(publicInfo.profileBio || "");
        setProfilePronouns(publicInfo.profilePronouns || "");
        setProfileLinks(publicInfo.profileLinks || "");
        setProfileCustomCSS(publicInfo.profileCustomCSS || "");
        setProfilePictureUrl(publicInfo.profilePictureUrl);
        setProfileBannerUrl(publicInfo.profileBannerUrl);
        setPinnedPostUuid(publicInfo.pinnedPostUuid);
    });

    async function savePublicInfo() {
        const publicInfo = {
            userId: userId,
            displayName: displayName,
            profileBio: profileBio,
            profilePronouns: profilePronouns,
            profileLinks: profileLinks,
            profileCustomCSS: profileCustomCSS,
            profilePictureUrl: profilePictureUrl,
            profileBannerUrl: profileBannerUrl,
            pinnedPostUuid: (pinnedPostUuid == "") ? undefined : pinnedPostUuid
        };

        const res = await setPublicInfo(publicInfo);
        if (res) {
            alert("Public info saved!");
        } else {
            alert("Failed to save public info");
        }
    }

    return <UnifiedMenu
        divSizes={{left: "20vw", main: "60vw", right: "20vw"}}
        mainDivData={
            <div>
                <div className={styles.MainDiv}>
                    <h1>Public Info Settings</h1>

                    Generated Handle: @<span>{userId}</span><br/>
                    <br/>
                    <hr/>
                    <br/>

                    <h3 style={{textAlign: "left"}}>Display Name</h3>
                    <input type="text" value={displayName} onChange={(e) => {
                        setDisplayName(e.target.value);
                    }} placeholder={"Display Name"}/>
                    <br/><br/>

                    <h3 style={{textAlign: "left"}}>Pronouns</h3>
                    <input type="text" value={profilePronouns} onChange={(e) => {
                        setProfilePronouns(e.target.value);
                    }} placeholder={"Pronouns"}/>
                    <br/><br/>

                    <h3 style={{textAlign: "left"}}>Bio</h3>
                    <textarea value={profileBio} onChange={(e) => {
                        setProfileBio(e.target.value);
                    }} placeholder={"Bio"}/>
                    <br/><br/>

                    <h3 style={{textAlign: "left"}}>Links</h3>
                    <textarea value={profileLinks} onChange={(e) => {
                        setProfileLinks(e.target.value);
                    }} placeholder={"Links"}/>
                    <br/><br/>

                    <h3 style={{textAlign: "left"}}>Custom CSS</h3>
                    <textarea value={profileCustomCSS} onChange={(e) => {
                        setProfileCustomCSS(e.target.value);
                    }} placeholder={"/*Custom CSS - NOT SUPPORTED YET*/"}/>
                    <br/><br/>

                    <h3>Profile Picture</h3>
                    <img src={profilePictureUrl ? profilePictureUrl : "/goofy-media-front/unknown_user.png"}></img>
                    <button onClick={async () => {
                        const res = await uploadMediaToServer();
                        if (res == undefined) {
                            if (confirm("Do you want to reset the PFP?"))
                                setProfilePictureUrl(undefined);
                        }
                        else {
                            setProfilePictureUrl(res.url);
                        }
                    }}>Upload Profile Picture
                    </button>
                    <br/><br/>

                    <h3>Profile Banner</h3>
                    <button onClick={async () => {
                        alert("Not implemented yet!");
                    }}>Upload Profile Banner
                    </button>
                    <br/>
                    <br/>

                    <h3 style={{textAlign: "left"}}>Pinned Post</h3>
                    <input type="text" value={(pinnedPostUuid != undefined) ? pinnedPostUuid : ""} onChange={(e) => {
                        setPinnedPostUuid(e.target.value);
                    }} placeholder={"Pinned Post UUID"}/>
                    <br/><br/>

                    <div className={styles.FinalButtonContainer}>
                        <button onClick={async () => {
                            if (confirm("You sure?"))
                                await savePublicInfo();
                        }}>Save Public Info
                        </button>

                        <button onClick={async () => {
                            if (confirm("You sure? (This won't save the reset)")) {
                                setDisplayName("");
                                setProfileBio("");
                                setProfilePronouns("");
                                setProfileLinks("");
                                setProfileCustomCSS("");
                                setProfilePictureUrl(undefined);
                                setProfileBannerUrl(undefined);
                                setPinnedPostUuid(undefined);
                            }
                        }}>Reset
                        </button>
                    </div>
                </div>
            </div>
        }
    />;
}
'use client';

import styles from "./page.module.css";
import MainFooter from "@/comp/mainFooter";
import {GlobalStuff, initGlobalState} from "@/lib/globalStateStuff";
import {goPath} from "@/lib/goPath";
import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import {initLocalSettings, LocalSettings, saveLocalSettings, saveLocalSettingsKey} from "@/lib/localSettings";

export default function Home() {
    const pathName = usePathname();
    const [userId, setUsername] = useState("...");
    const [autoLoadMedia, setAutoLoadMedia] = useState(false);

    useEffect(() => {
        initGlobalState(pathName, true, false, async () => {
            if (!GlobalStuff.loggedIn)
                goPath("/guest/login");

            setUsername(GlobalStuff.userId);
            setAutoLoadMedia(LocalSettings.autoLoadMedia);
        });
    })

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div style={{width: "80%", margin: "auto", border: "1px solid white", padding: "10px"}}>
                    <h1>Account Settings</h1>

                    Generated Handle: @<span>{userId}</span><br/>
                    <br/>

                    <h2>Settings</h2>
                    Auto Load Media: &nbsp;
                    <input type="checkbox" checked={autoLoadMedia} onChange={async (e) => {
                        const yes = e.target.checked;
                        await saveLocalSettingsKey("autoLoadMedia", yes);
                        setAutoLoadMedia(yes);
                    }}/><br/>

                    <br/>
                    <button>Logout</button>
                    <br/>
                    <button>Delete All Data</button>
                    <br/>

                </div>
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

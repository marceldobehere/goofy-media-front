'use client';

import styles from "./page.module.css";
import MainFooter from "@/comp/mainFooter";
import {GlobalStuff, initGlobalState} from "@/lib/globalStateStuff";
import {goPath} from "@/lib/goPath";
import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import {initLocalSettings, LocalSettings, saveLocalSettings, saveLocalSettingsKey} from "@/lib/localSettings";
import {getAllAvailableClassNames} from "@/lib/customCssConverter";

export default function Home() {
    const pathName = usePathname();
    const [userId, setUsername] = useState("...");
    const [autoLoadMedia, setAutoLoadMedia] = useState(false);
    const [enabledCustomPostCss, setEnabledCustomPostCss] = useState(true);
    const [customCss, setCustomCss] = useState("");

    useEffect(() => {
        initGlobalState(pathName, true, false, async () => {
            if (!GlobalStuff.loggedIn)
                goPath("/guest/login");

            setUsername(GlobalStuff.userId);
            setAutoLoadMedia(LocalSettings.autoLoadMedia);
            setEnabledCustomPostCss(LocalSettings.enabledCustomPostCss);
            setCustomCss(LocalSettings.customCss);
        });
    })

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div style={{width: "80%", margin: "auto", border: "1px solid white", padding: "10px"}}>
                    <h1>Account Settings</h1>

                    Generated Handle: @<span>{userId}</span><br/>
                    <br/>

                    <h3 style={{textAlign: "left"}}>Settings</h3>
                    Auto Load Media: &nbsp;
                    <input type="checkbox" checked={autoLoadMedia} onChange={async (e) => {
                        const yes = e.target.checked;
                        await saveLocalSettingsKey("autoLoadMedia", yes);
                        setAutoLoadMedia(yes);
                    }}/><br/>

                    Enable Custom Post CSS: &nbsp;
                    <input type="checkbox" checked={enabledCustomPostCss} onChange={async (e) => {
                        const yes = e.target.checked;
                        await saveLocalSettingsKey("enabledCustomPostCss", yes);
                        setEnabledCustomPostCss(yes);
                    }}/><br/>
                    <br/>

                    <h3>Custom CSS</h3>
                    <textarea className={styles.CssTextArea} value={customCss}
                              onChange={async (e) => {
                                  setCustomCss(e.target.value);
                              }}
                              placeholder={"/* Custom CSS */"}
                                onKeyDown={(e) => {
                                    if (e.key === "Tab") {
                                        e.preventDefault()
                                        // if tab add tab, else remove tab
                                        if (!e.shiftKey) {
                                            const start = e.target.selectionStart;
                                            const end = e.target.selectionEnd;
                                            const value = e.target.value;
                                            e.target.value = value.substring(0, start) + "\t" + value.substring(end);
                                            e.target.selectionStart = e.target.selectionEnd = start + 1;
                                        } else {
                                            const start = e.target.selectionStart;
                                            const end = e.target.selectionEnd;
                                            const value = e.target.value;
                                            if (value.substring(start - 1, start) === "\t") {
                                                e.target.value = value.substring(0, start - 1) + value.substring(end);
                                                e.target.selectionStart = e.target.selectionEnd = start - 1;
                                            }
                                        }
                                    }
                                    // CTRL + S
                                    else if (e.ctrlKey && e.key === "s") {
                                        e.preventDefault();
                                        saveLocalSettingsKey("customCss", customCss);
                                    }
                                }}
                    ></textarea>
                    <div style={{margin: "auto", textAlign: "center"}}>
                        <button onClick={async () => {
                            await saveLocalSettingsKey("customCss", customCss);
                        }}>Apply
                        </button>
                        &nbsp;&nbsp;&nbsp;&nbsp;

                        <button onClick={async () => {
                            setCustomCss(LocalSettings.customCss);
                        }}>Revert
                        </button>
                        &nbsp;&nbsp;&nbsp;&nbsp;

                        <button onClick={async () => {
                            setCustomCss("");
                            await saveLocalSettingsKey("customCss", "");
                        }}>Reset
                        </button>
                        &nbsp;&nbsp;&nbsp;&nbsp;

                        <button onClick={async () => {
                            const classNames = getAllAvailableClassNames();
                            alert("All available classes: \n" + classNames.join("\n"));
                        }}>Show All Custom Classes
                        </button>
                    </div>
                    <br/>

                    <br/>
                    <button onClick={() => {
                        alert("Not implemented")
                    }}>Logout
                    </button>
                    <br/>
                    <button onClick={() => {
                        alert("Not implemented")
                    }}>Delete All Data
                    </button>
                    <br/>

                </div>
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

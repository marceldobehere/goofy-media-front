'use client';

import styles from "./page.module.css";
import {GlobalStuff, logout, LsReset, useGlobalState} from "@/lib/globalStateStuff";
import {goPath} from "@/lib/goPath";
import {useState} from "react";
import {usePathname} from "next/navigation";
import {LocalSettings, saveLocalSettingsKey} from "@/lib/localSettings";
import {getAllAvailableClassNames} from "@/lib/customCssConverter";

import QRCodeGen from "@/lib/qrgen/qrcodegen";
import {deleteWithAuth, postNoAuth, postWithAuth} from "@/lib/req";
import UnifiedMenu from "@/comp/unified_layout/unifiedMenu";
import {registerUserWebhook} from "@/lib/notifications/notificationUtils";
import {downloadTextFile, fileToString, uploadData} from "@/lib/fileUtils";
import {checkNotifications, playBeep} from "@/lib/notifications";

const QrCode = QRCodeGen.QrCode;

function toSvgString(qr, border, lightColor, darkColor) {
    if (border < 0)
        throw new RangeError("Border must be non-negative");
    let parts = [];
    for (let y = 0; y < qr.size; y++) {
        for (let x = 0; x < qr.size; x++) {
            if (qr.getModule(x, y))
                parts.push(`M${x + border},${y + border}h1v1h-1z`);
        }
    }
    return `<?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${qr.size + border * 2} ${qr.size + border * 2}" stroke="none">
            <rect width="100%" height="100%" fill="${lightColor}"/>
            <path d="${parts.join(" ")}" fill="${darkColor}"/>
        </svg>`;
}

export default function Home() {
    const pathName = usePathname();
    const [userId, setUsername] = useState("...");
    const [autoLoadMedia, setAutoLoadMedia] = useState(false);
    const [autoLoadMediaFromTrustedUrls, setAutoLoadMediaFromTrustedUrls] = useState(true);
    const [trustedAutoLoadMediaUrls, setTrustedAutoLoadMediaUrls] = useState([]);
    const [enabledCustomPostCss, setEnabledCustomPostCss] = useState(true);
    const [enabledCustomPostAnimations, setEnabledCustomPostAnimations] = useState(false);
    const [openPostNewTab, setOpenPostNewTab] = useState(true);
    const [extendPostHitbox, setExtendPostHitbox] = useState(false);
    const [customCss, setCustomCss] = useState("");
    const [generalNotifType, setGeneralNotifType] = useState("none");
    const [newPostNotifType, setNewPostNotifType] = useState("none");
    const [uploadImagesUsingCanvas, setUploadImagesUsingCanvas] = useState(true);

    const [qrSvg, setQrSvg] = useState({html: "", size: "0px"});

    function generateQRCode() {
        try {
            const code = QrCode.encodeText(`${GlobalStuff.server}*${GlobalStuff.publicKey}*${GlobalStuff.privateKey}`, QrCode.Ecc.MEDIUM);
            const svg = toSvgString(code, 2, "#ffffff", "#000000");

            let pxSize = code.size + 4;
            if (pxSize * 4 < window.innerWidth * 0.75)
                pxSize *= 4;
            else if (pxSize * 2 < window.innerWidth * 0.75)
                pxSize *= 2;

            setQrSvg({html: svg, size: `${pxSize}px`});
        } catch (e) {
            console.error(e);
            alert("Failed to create QR Code: " + e.message)
        }
    }

    useGlobalState(pathName, false, false, async () => {
        if (GlobalStuff.loggedIn) {
            setUsername(GlobalStuff.userId);
        } else {
            setUsername("Guest");
        }

        setAutoLoadMedia(LocalSettings.autoLoadMedia);
        setAutoLoadMediaFromTrustedUrls(LocalSettings.autoLoadMediaFromTrustedUrls);
        setTrustedAutoLoadMediaUrls(LocalSettings.trustedAutoLoadMediaUrls);
        setEnabledCustomPostCss(LocalSettings.enabledCustomPostCss);
        setCustomCss(LocalSettings.customCss);
        setOpenPostNewTab(LocalSettings.openPostInNewTab);
        setExtendPostHitbox(LocalSettings.extendPostClickHitbox);
        setEnabledCustomPostAnimations(LocalSettings.enabledCustomPostAnimations);
        setGeneralNotifType(LocalSettings.generalNotificationType);
        setNewPostNotifType(LocalSettings.newPostNotificationType);
        setUploadImagesUsingCanvas(LocalSettings.uploadImagesUsingCanvas);
    });

    return <UnifiedMenu
        divSizes={{left: "20vw", main: "60vw", right: "20vw"}}
        mainDivData={
            <div>
                <div className={styles.MainDiv}>
                    <div className={styles.FirstSection}>
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

                        Auto Load Media From Trusted Urls: &nbsp;
                        <input type="checkbox" checked={autoLoadMediaFromTrustedUrls} onChange={async (e) => {
                            const yes = e.target.checked;
                            await saveLocalSettingsKey("autoLoadMediaFromTrustedUrls", yes);
                            setAutoLoadMediaFromTrustedUrls(yes);
                        }}/><br/>

                        Trusted Auto Load Media URLs: &nbsp;
                        <input className={styles.TrustedUrlsInput} type="text"
                               value={trustedAutoLoadMediaUrls.join(",")}
                               onChange={async (e) => {
                                   const urls = e.target.value.split(",").map(url => url.trim());
                                   setTrustedAutoLoadMediaUrls(urls);
                               }} placeholder={"Comma separated list of URLs"}/>
                        <button className={styles.TrustedUrlsInputButton} onClick={async () => {
                            const urls = document.querySelector(`.${styles.TrustedUrlsInput}`).value.split(",").map(url => url.trim());
                            await saveLocalSettingsKey("trustedAutoLoadMediaUrls", urls);
                            setTrustedAutoLoadMediaUrls(urls);
                        }}>Save
                        </button>
                        <br/>

                        Enable Custom Post CSS: &nbsp;
                        <input type="checkbox" checked={enabledCustomPostCss} onChange={async (e) => {
                            const yes = e.target.checked;
                            await saveLocalSettingsKey("enabledCustomPostCss", yes);
                            setEnabledCustomPostCss(yes);
                        }}/><br/>

                        Enable Custom Post Animations: &nbsp;
                        <input type="checkbox" checked={enabledCustomPostAnimations} onChange={async (e) => {
                            const yes = e.target.checked;
                            await saveLocalSettingsKey("enabledCustomPostAnimations", yes);
                            setEnabledCustomPostAnimations(yes);
                        }}/><br/>

                        Open Post in new Tab: &nbsp;
                        <input type="checkbox" checked={openPostNewTab} onChange={async (e) => {
                            const yes = e.target.checked;
                            await saveLocalSettingsKey("openPostInNewTab", yes);
                            setOpenPostNewTab(yes);
                        }}/><br/>

                        Click anywhere on post to open it: &nbsp;
                        <input type="checkbox" checked={extendPostHitbox} onChange={async (e) => {
                            const yes = e.target.checked;
                            await saveLocalSettingsKey("extendPostClickHitbox", yes);
                            setExtendPostHitbox(yes);
                        }}/><br/>

                        Upload Images using Canvas API: &nbsp;
                        <input type="checkbox" checked={uploadImagesUsingCanvas} onChange={async (e) => {
                            const yes = e.target.checked;
                            await saveLocalSettingsKey("uploadImagesUsingCanvas", yes);
                            setUploadImagesUsingCanvas(yes);
                        }}/><br/>

                        {GlobalStuff.loggedIn ?
                            <>
                                <br/>
                                <hr/>
                                <br/>
                                <h3 style={{textAlign: "left"}}>Notification Settings</h3>
                                <br/>

                                <h4>General Notifications:</h4>
                                <button onClick={async () => {
                                    const url = prompt("Enter Webhook URL: (Leave empty to remove notifications)")
                                    if (url == undefined)
                                        return;
                                    const res = await registerUserWebhook("all-notifications", url);
                                    if (res) {
                                        alert((url == "" ? "Removed" : "Set") + " webhook for all notifications");
                                    } else {
                                        alert("Failed to set webhook!");
                                    }
                                }}>Set Discord Webhook
                                </button>
                                <br/>

                                Browser Notification: &nbsp;
                                <select id="notification-type" onChange={async (e) => {
                                    const type = e.target.value;
                                    setGeneralNotifType(type);
                                    await saveLocalSettingsKey("generalNotificationType", type);
                                    await checkNotifications()
                                }} value={generalNotifType}>
                                    <option value="none">None</option>
                                    <option value="audio">Audio</option>
                                    <option value="notification">Notification</option>
                                </select>

                                <br/><br/>
                                <h4>New Posts from people you follow:</h4>
                                <button onClick={async () => {
                                    const url = prompt("Enter Webhook URL: (Leave empty to remove notifications)")
                                    if (url == undefined)
                                        return;
                                    const res = await registerUserWebhook("new-post-in-feed", url);
                                    if (res) {
                                        alert((url == "" ? "Removed" : "Set") + " webhook for new post notifications");
                                    } else {
                                        alert("Failed to set webhook!");
                                    }
                                }}>Set Discord Webhook
                                </button>
                                <br/>


                                Browser Notification: &nbsp;
                                <select id="notification-type" onChange={async (e) => {
                                    const type = e.target.value;
                                    setNewPostNotifType(type);
                                    await saveLocalSettingsKey("newPostNotificationType", type);
                                    await checkNotifications()
                                }} value={newPostNotifType}>
                                    <option value="none">None</option>
                                    {/*<option value="audio">Audio</option>*/}
                                    {/*<option value="notification">Notification</option>*/}
                                </select>


                                <br/><br/>
                                <br/>
                                <button onClick={playBeep}>Play Notification Sound</button>
                                <br/>
                                <button onClick={() => {
                                    alert("To set up webhook notifications you need to do the following:\n" +
                                        " - Create a Discord server (Or use one you own)\n" +
                                        " - Create one or more channels for your notifications to get sent to\n" +
                                        " - Open the Server Settings and go to Integrations\n" +
                                        " - Click on WebHooks and create a new WebHook\n" +
                                        " - Give it a name and select the channel it should send messages to\n" +
                                        " - Copy the WebHook URL and use it for one or more of the settings above.\n" +
                                        " - That was it!")
                                }}>How to set up webhook notifications
                                </button>
                            </> : <></>}


                        <br/><br/>
                        <hr/>
                        <br/><br/>
                    </div>

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
                            if (!confirm("Are you sure?"))
                                return;

                            setCustomCss("");
                            await saveLocalSettingsKey("customCss", "");
                        }}>Reset
                        </button>
                        &nbsp;&nbsp;&nbsp;&nbsp;

                        <button onClick={async () => {
                            downloadTextFile(customCss, "customCss.css");
                        }}>Download
                        </button>
                        &nbsp;&nbsp;&nbsp;&nbsp;

                        <button onClick={async () => {
                            if (!confirm("Are you sure?"))
                                return;
                            const files = await uploadData();
                            if (files == undefined || files.length == 0)
                                return;

                            const text = await fileToString(files[0]);
                            setCustomCss(text);
                            await saveLocalSettingsKey("customCss", text);
                        }}>Upload
                        </button>
                        &nbsp;&nbsp;&nbsp;&nbsp;

                        <button onClick={async () => {
                            alert("All available classes can be found on the Github Repo");
                        }}>Help
                        </button>
                    </div>
                    <br/>
                    <br/>

                    <h3>{GlobalStuff.loggedIn ? "" : "Anonymous "}Feedback</h3>
                    <div style={{margin: "auto", textAlign: "center"}}>
                        <textarea className={styles.FeedbackTextArea} id={"feedback-textarea"}></textarea>
                        <button onClick={async () => {
                            const feedback = document.getElementById("feedback-textarea");
                            const msg = feedback.value;
                            if (msg == "") {
                                alert("Feedback cannot be empty");
                                return;
                            }

                            const res = (GlobalStuff.loggedIn ?
                                await postWithAuth('/user/verify/feedback-msg', {msg: msg}, undefined, true) :
                                await postNoAuth('/guest/register/feedback-msg', {msg: msg}, undefined, true));
                            if (res.status == 200) {
                                feedback.value = "";
                                alert("Message sent!");
                            } else
                                alert("Failed to send message: " + await res.text());
                        }}>Send Feedback
                        </button>
                    </div>
                    <br/>
                    <br/>


                    {(GlobalStuff.loggedIn) ? <>
                        <h3>QR Code Login</h3>
                        <br/>

                        <div id={"qr-btn"} style={{margin: "auto", width: "fit-content", textAlign: "center"}}>
                            <button onClick={() => {
                                if (qrSvg.html == "") {
                                    if (confirm("Are you sure? Do not let anyone else see the QR code"))
                                        if (confirm("Make sure you are in a private area and no one else can see the QR code! "))
                                            generateQRCode();
                                } else
                                    setQrSvg({html: "", size: "0px"});
                            }}>{(qrSvg.html == "" ? "Generate QR Code for login" : "Hide QR Code")}</button>
                            <br/><br/>
                            <svg style={{width: qrSvg.size, height: qrSvg.size}}
                                 dangerouslySetInnerHTML={{__html: qrSvg.html}}></svg>
                        </div>
                    </> : ""}

                    <br/><br/>
                    <hr/>
                    <br/><br/>

                    <div className={styles.LastButtons}>
                        {(GlobalStuff.loggedIn) ? <>
                            <button onClick={async () => {
                                await logout();
                                goPath("/guest/login")
                            }}>Logout
                            </button>
                            <br/>
                        </> : ""}

                        {(GlobalStuff.loggedIn) ? <>
                            <button onClick={async () => {
                                if (!confirm("Are you sure?"))
                                    return;
                                if (!confirm("Are you very sure?"))
                                    return;
                                if (!confirm("Are you really sure? Your account will be lost and not exist anymore."))
                                    return;
                                if (!confirm("Press OK to delete your Account."))
                                    return;

                                const res = await deleteWithAuth("/user/user-data/");
                                if (res)
                                    alert("Account deleted");
                                else
                                    alert("Failed to delete account");

                                await logout();

                                goPath("/")
                            }}>Delete Account and all associated Data
                            </button>
                            <br/>
                        </> : ""}

                        <button onClick={() => {
                            if (confirm("Are you sure?")) {
                                LsReset();
                                goPath("/")
                            }
                        }}>Delete all Data in LocalStorage
                        </button>
                        <br/>
                    </div>
                </div>
            </div>
        }
    />;
}

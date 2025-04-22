import styles from "@/app/user/home/entries/postEntry.module.css";
import {useEffect, useState} from "react";
import {basePath, goPath} from "@/lib/goPath";
import {GlobalStuff} from "@/lib/globalStateStuff";
import {LocalSettings} from "@/lib/localSettings";
import {getPostUrl} from "@/lib/publicInfo/links";

const loadGetPostHtml = async () => {
    return (await import("@/app/user/home/entries/postProcess.js")).getPostHtml;
}

export default function NewsEntry({post}) {
    const [innerHTML, setInnerHTML] = useState();
    useEffect(() => {
        loadGetPostHtml().then((getPostHtml) => {
            setInnerHTML(getPostHtml(post.text));
        });
    }, []);

    const openInNewTab = LocalSettings.openPostInNewTab;

    return (
        <div className={styles.PostEntryDiv}>
            <h3 className={styles.PostEntryHeader}><a style={{textDecoration: "none"}}
                                                      href={getPostUrl(post.uuid)} target={openInNewTab ? "_blank" : ""}>{post.title}</a>
            </h3>

            <div className={"post-click-div-thing"} onClick={(event) => {
                if (event.target == undefined || event.target.tagName == undefined || !LocalSettings.extendPostClickHitbox)
                    return;
                const tagName = event.target.tagName.toLowerCase();
                if (["a", "img", "video", "audio", "input"].includes(tagName))
                    return console.info("> Ignoring Click on: " + tagName);

                goPath(`/user/post?uuid=${encodeURIComponent(post.uuid)}&serverId=${encodeURIComponent(GlobalStuff.server)}`, openInNewTab);
                event.preventDefault();
            }}>
                <div style={{maxHeight: "18rem", overflowY: "auto"}}>
                    {innerHTML !== undefined ?
                        <p className={styles.PostBody} dangerouslySetInnerHTML={{__html: innerHTML}}></p> :
                        <p className={styles.PostBody}>{post.text}</p>}
                </div>
            </div>
            <br/>
        </div>
    );
}
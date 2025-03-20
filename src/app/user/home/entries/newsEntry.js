import styles from "@/app/user/home/entries/postEntry.module.css";
import {useEffect, useState} from "react";
// import {getPostHtml} from "@/app/user/home/entries/postProcess";

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

    return (
        <div className={styles.PostEntryDiv}>
            <h3 className={styles.PostEntryHeader}>{post.title}</h3>
            {innerHTML !== undefined ?
                <p className={styles.PostBody} dangerouslySetInnerHTML={{__html: innerHTML}}></p> :
                <p className={styles.PostBody}>{post.text}</p>}
        </div>
    );
}
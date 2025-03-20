import styles from "@/app/user/home/entries/postEntry.module.css";
import {getPostHtml} from "@/app/user/home/entries/postProcess";

export default function NewsEntry({post}) {
    let innerHTML = getPostHtml(post.text);

    return (
        <div className={styles.PostEntryDiv}>
            <h3 className={styles.PostEntryHeader}>{post.title}</h3>
            {innerHTML !== undefined ?
                <p className={styles.PostBody} dangerouslySetInnerHTML={{__html: innerHTML}}></p> :
                <p className={styles.PostBody}>{post.text}</p>}
        </div>
    );
}
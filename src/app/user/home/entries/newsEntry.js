import styles from "@/app/user/home/entries/postEntry.module.css";

export default function NewsEntry({post}) {
    return (
        <div className={styles.PostEntryDiv}>
            <h3 className={styles.PostEntryHeader}>{post.title}</h3>
            <p className={styles.PostBody}>{post.text}</p>
        </div>
    );
}
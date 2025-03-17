import styles from "@/app/user/home/entries/postEntry.module.css";
import Link from "next/link";

export default function PostEntry({post}) {
    return (
        <div className={styles.PostEntryDiv}>
            <div className={styles.PostUserHeader}>
                <b>{post.displayName}</b> @{post.author} - {new Date(post.createdAt).toLocaleString()}
            </div>

            <h3 className={styles.PostEntryHeader}>{post.title}</h3>
            <p className={styles.PostBody}>{post.text}</p>
            <p>Tags: {post.tags.map((tag, idx) => (<span key={idx}><Link href={`/guest/search?tag=${encodeURIComponent(tag)}`}>#{tag}</Link>&nbsp;</span>))}</p>
        </div>
    );
}
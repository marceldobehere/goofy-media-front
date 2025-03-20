'use client';

import styles from "@/app/user/home/entries/postEntry.module.css";
import {goPath} from "@/lib/goPath";
import {getPostHtml} from "@/app/user/home/entries/postProcess";

export default function PostEntry({post}) {
    let innerHTML = getPostHtml(post.text);

    return (
        <div className={styles.PostEntryDiv}>
            <div className={styles.PostUserHeader}>
                <b>{post.displayName}</b> @{post.author} - {new Date(post.createdAt).toLocaleString()}
            </div>

            <h3 className={styles.PostEntryHeader}>{post.title}</h3>

            {innerHTML !== undefined ?
                <p className={styles.PostBody} dangerouslySetInnerHTML={{__html: innerHTML}}></p> :
                <p className={styles.PostBody}>{post.text}</p>}

            <p className={styles.PostTags}>Tags: {post.tags.map((tag, idx) => (<span key={idx}><a onClick={() => {
                goPath(`/guest/search?tag=${encodeURIComponent(tag)}`)
            }}>#{tag}</a>&#32;</span>))}</p>
        </div>
    );
}
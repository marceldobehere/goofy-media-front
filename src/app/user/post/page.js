'use client';

import styles from "./page.module.css";
import Link from "next/link";
import MainFooter from "@/comp/mainFooter";

export default function Home() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Post</h1>
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

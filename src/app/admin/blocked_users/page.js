'use client';

import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Admin - Blocked Users</h1>
      </main>
        <footer className={styles.footer}>
            <p>lol</p>
            <Link href={"/"}>Home</Link>
        </footer>
    </div>
  );
}

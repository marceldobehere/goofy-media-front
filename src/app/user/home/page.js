'use client';

import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Home</h1>
      </main>
        <footer className={styles.footer}>
            <p>lol</p>
            <a href={"/"}>Home</a>
        </footer>
    </div>
  );
}

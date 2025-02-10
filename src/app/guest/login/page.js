'use client';

import styles from "@/app/page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Login</h1>

        <div className={"container"}>A</div>

      </main>
        <footer className={styles.footer}>
            <p>lol</p>
            <a href={"/user/home"}>Home</a>
        </footer>
    </div>
  );
}

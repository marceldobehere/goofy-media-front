import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Hello</h1>
      </main>
        <footer className={styles.footer}>
            <p>lol</p>

            <a href={"/login"}>Login</a><br></br>
            <a href={"/enc"}>Enc</a><br></br>
        </footer>
    </div>
  );
}

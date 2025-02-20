import styles from "./page.module.css";
import MainFooter from "@/comp/mainFooter";

export default function Home() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Goofy Media</h1>

                <a href={"/guest/login"}>Login</a><br></br>
            </main>

            <MainFooter></MainFooter>
        </div>
    );
}

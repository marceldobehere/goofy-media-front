import styles from "./page.module.css";
import MainFooter from "@/comp/mainFooter";
import Link from "next/link";

export default function Home() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Goofy Media</h1>

                <p>
                    Work In Progress Goofy Social Media app<br/>
                    Open source <a href={"https://github.com/marceldobehere/goofy-media-front"}>here</a><br/>
                    Made by <a href={"https://github.com/marceldobehere"}>@marceldobehere</a>.
                </p>
                <br/>

                <Link href={"/guest/login"}>Login</Link><br/>
                <Link href={"/guest/register"}>Register</Link><br/>
                <Link href={"/user/home"}>Home</Link><br/>

            </main>

            <MainFooter></MainFooter>
        </div>
    );
}

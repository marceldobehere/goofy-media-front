import styles from "./page.module.css";
import MainFooter from "@/comp/mainFooter";
import Link from "next/link";

export default function Home() {
    return (
        <div className={styles.page}>
            <main>

                <div className={styles.CenterDiv}>
                    <div className={styles.MainCont}>
                        <h2 className={styles.Title}>Goofy Media</h2>

                        <p className={styles.Introduction}>
                            The goofiest and most peak<br/>
                            social media you've seen around.
                        </p>

                        <p className={styles.Description}>
                        <span className={styles.Keyword}><a href={"https://github.com/marceldobehere/goofy-media-front"}
                                                            target={"_blank"}>Open source</a></span> and <span
                            className={styles.Keyword}>secure</span>, <br/>
                            with <span className={styles.Keyword}>decentralization</span> in mind.
                        </p>

                        <p className={styles.ExtraInfo}>
                            <span className={styles.RoccQuality}>100% Certified <a
                                href={"https://github.com/marceldobehere"}
                                target={"_blank"}>Rocc</a> Quality.</span><br/>
                            <span className={styles.SmolNote}>Also still work in progress lol</span>
                        </p>

                        <div className={styles.MainButtons}>
                            <Link href={"/guest/login"}>Login</Link>
                            <Link href={"/guest/register"}>Register</Link>
                            <Link href={"/user/home"}>Explore as a Guest</Link>
                        </div>
                    </div>
                </div>
            </main>

            <MainFooter></MainFooter>
        </div>
    );
}

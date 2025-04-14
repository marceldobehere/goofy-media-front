'use client';

import styles from "./page.module.css";
import MainFooter from "@/comp/mainFooter";
import Link from "next/link";

export default function Home() {

    const kwOpenSource = <span className={styles.Keyword}><a
        href={"https://github.com/marceldobehere/goofy-media-front"}
        target={"_blank"}>Open source</a></span>;

    const kwSecure = <span className={styles.Keyword}><a
        href={"https://github.com/marceldobehere/goofy-media-front?tab=readme-ov-file#security"}
        target={"_blank"}>secure</a></span>;

    const kwDecentralization = <span className={styles.Keyword}><a
        href={"https://github.com/marceldobehere/goofy-media-front?tab=readme-ov-file#decentralization"}
        target={"_blank"}>decentralization</a></span>;

    const kwRocc = <a href={"https://github.com/marceldobehere"} target={"_blank"}>Rocc</a>;

    const kwWip = <span className={styles.SmolNote}><a
        href={"https://github.com/marceldobehere/goofy-media-front?tab=readme-ov-file#features"}>Also still work in progress lol</a></span>;

    return (
        <div className={styles.page}>
            <style jsx global>{`
                @media (max-width: 370px) {
                    html {
                        font-size: 14px;
                    }
                }

                @media (max-width: 340px) {
                    html {
                        font-size: 13px;
                    }
                }

                @media (max-width: 320px) {
                    html {
                        font-size: 12px;
                    }
                }

                @media (max-width: 250px) {
                    html {
                        font-size: 11px;
                    }
                }

                @media (max-width: 220px) {
                    html {
                        font-size: 8px;
                    }
                }
            `}</style>
            <main>
                <div className={styles.CenterDiv}>
                    <div className={styles.MainCont}>
                        <h2 className={styles.Title}>Goofy Media</h2>

                        <p className={styles.Introduction}>
                            The goofiest and most peak<br/>
                            social media you've seen around.
                        </p>

                        <p className={styles.Description}>
                            {kwOpenSource} and {kwSecure}, <br/>
                            with {kwDecentralization} in mind.
                        </p>

                        <p className={styles.ExtraInfo}>
                            <span className={styles.RoccQuality}>100% Certified {kwRocc} Quality.</span><br/>
                            {kwWip}
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

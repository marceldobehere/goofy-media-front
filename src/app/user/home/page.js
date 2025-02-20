'use client';

import styles from "./page.module.css";
import {GlobalStuff, initGlobalState} from "@/lib/globalStateStuff";
import {useEffect} from "react";
import MainFooter from "@/comp/mainFooter";

export default function Home() {
    useEffect(() => {
        initGlobalState(async () => {
            if (!GlobalStuff.loggedIn) {
                window.location.href = "/guest/login";
            }
        });
    })


    return (
        <div className={styles.page}>
            <main className={styles.main}>

                <nav className={styles.NavBar}>
                    <h2>Navigation</h2>
                    <p>
                        sad jfhklajsdhfasdfasd<br/>
                        fadsjfhadsjkhfljkadshfasd<br/>
                        fasdjfasdjfh ljkdsahfdas<br/>
                        fadsjhfadskjh fadsf<br/>
                        asdfjkasdhfkjadsh<br/>
                        sdjfasljkdfsadkj
                    </p>
                </nav>

                <div className={styles.PostDiv}>
                    <h1>User Home</h1>

                    Bla, Bla

                    <div>
                        <div>
                            <h2>Post abc</h2>
                            <p>
                                kajsdfh adsf sadg fsadfkjadshgf ads<br/>
                                a afdsa fhaskdh fadskl flasjdkf lkdjsaf<br/>
                                sd fads fladskf asjhj fjklsa hjasf<br/>
                                asdf jasdh fkjadshjklhsdakljf sad fadsf
                                fasdfasd fasd fasd
                            </p>
                        </div>
                        <div>
                            <h2>Post abc</h2>
                            <p>
                                kajsdfh adsf sadg fsadfkjadshgf ads<br/>
                                a afdsa fhaskdh fadskl flasjdkf lkdjsaf<br/>
                                sd fads fladskf asjhj fjklsa hjasf<br/>
                                asdf jasdh fkjadshjklhsdakljf sad fadsf
                                fasdfasd fasd fasd
                            </p>
                        </div>
                        <div>
                            <h2>Post abc</h2>
                            <p>
                                kajsdfh adsf sadg fsadfkjadshgf ads<br/>
                                a afdsa fhaskdh fadskl flasjdkf lkdjsaf<br/>
                                sd fads fladskf asjhj fjklsa hjasf<br/>
                                asdf jasdh fkjadshjklhsdakljf sad fadsf<br/>
                                fasdfasd fasd fasd
                            </p>
                        </div>
                        <div>
                            <h2>Post abc</h2>
                            <p>
                                kajsdfh adsf sadg fsadfkjadshgf ads
                                a afdsa fhaskdh fadskl flasjdkf lkdjsaf
                                sd fads fladskf asjhj fjklsa hjasf<br/>
                                asdf jasdh fkjadshjklhsdakljf sad fadsf<br/>
                                fasdfasd fasd fasd<br/>
                            </p>
                        </div>
                        <div>
                            <h2>Post abc</h2>
                            <p>
                                kajsdfh adsf sadg fsadfkjadshgf ads<br/>
                                a afdsa fhaskdh fadskl flasjdkf lkdjsaf<br/>
                                sd fads fladskf asjhj fjklsa hjasf<br/>
                                asdf jasdh fkjadshjklhsdakljf sad fadsf
                                fasdfasd fasd fasd
                            </p>
                        </div>


                    </div>
                </div>

                <div className={styles.NewsDiv}>
                    <h2>Goofy Media News</h2>

                    <p>
                        asdf sadf<br/>
                        asdf asdf asdf<br/>
                        asdf asd fasdf asdf<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        sdaf adsf asdf sadf sad<br/>
                        f asdf saads
                    </p>
                </div>
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

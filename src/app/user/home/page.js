'use client';

import styles from "./page.module.css";
import {GlobalStuff, initGlobalState} from "@/lib/globalStateStuff";
import {useEffect, useState} from "react";
import MainFooter from "@/comp/mainFooter";

export default function Home() {
    let [showBurgerMenu, setBurger] =  useState(false);

    useEffect(() => {
        initGlobalState(true, async () => {
            if (!GlobalStuff.loggedIn) {
                window.location.href = "/guest/login";
            }
        });

        window.onresize = () => {
            if (showBurgerMenu && (window.getComputedStyle(document.documentElement).getPropertyValue('--show_hamburg') === '0')) {
                setBurger(false);
            }
        }
    })


    return (
        <div className={styles.page}>
            <main className={styles.main}>

                <nav className={showBurgerMenu ? styles.NavBar2 : styles.NavBar}>
                    <div className={styles.NavBarHamburg}>
                        <button onClick={() => {
                            setBurger(!showBurgerMenu);
                        }}>{showBurgerMenu ? "^" : "v"}</button>
                        <h2>Goofy Media</h2>
                    </div>
                    <div className={showBurgerMenu ? styles.None : styles.NavBarDiv}>
                        {showBurgerMenu ? <></> : <h2>Navigation</h2>}
                        <p>
                            <a href={"/"}>Lol 1</a><br/>
                            <a href={"/"}>Lol 2</a><br/>
                            <a href={"/"}>Lol 3</a><br/>
                            <a href={"/"}>Lol 4</a><br/>
                            <a href={"/"}>Lol 5</a><br/>
                        </p>
                    </div>
                </nav>

                <div className={styles.MainContent}>
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
                </div>

            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

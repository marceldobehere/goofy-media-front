'use client';

import styles from "./page.module.css";
import {GlobalStuff, initGlobalState} from "@/lib/globalStateStuff";
import {useEffect} from "react";
import MainFooter from "@/comp/mainFooter";

export default function Home() {
    useEffect(() => {
        initGlobalState(true, true, async () => {
            if (!GlobalStuff.loggedIn)
                return window.location.href = "/guest/login";
            if (!GlobalStuff.admin)
                return window.location.href = "/user/home";
        });
    })

  return (
      <div className={styles.page}>
          <main className={styles.main}>
              <h1>Admin Dashboard</h1>

              <a href={"/guest/login"}>Login</a><br/>
              <a href={"/guest/register"}>Register</a><br/>
              <a href={"/user/home"}>Home</a><br/>

          </main>

          <MainFooter></MainFooter>
      </div>
  );
}

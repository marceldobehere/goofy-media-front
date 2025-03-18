'use client';

import styles from "./page.module.css";
import Link from "next/link";
import MainFooter from "@/comp/mainFooter";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
          <div style={{width: "80%", margin: "auto", border: "1px solid white", padding: "10px"}}>
              <h1>Account Settings</h1>

              Generated Handle: @<span>{"lol"}</span><br/>
              <br/>


              <button>Logout</button><br/>
              <button>Delete All Data</button><br/>

          </div>
      </main>
        <MainFooter></MainFooter>
    </div>
  );
}

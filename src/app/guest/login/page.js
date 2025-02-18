'use client';

import styles from "@/app/page.module.css";
import {baseServer} from "@/lib/req";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Goofy Media</h1>

          <div className={"container"}>
              <h2>Login</h2>

              <p className={"cont-inp-header"}>Server Domain</p>
              <input defaultValue={baseServer} className={"cont-inp"}></input><br/>

              <p className={"cont-inp-header"}>Username / Public Key</p>
              <input type={"username"} className={"cont-inp"}></input><br/>

              <p className={"cont-inp-header"}>Password / Private Key</p>
              <input type={"password"} className={"cont-inp"}></input><br/>

              <input type="button" defaultValue="Login" className={"cont-btn"}></input>

              <a>Login via File</a><br/>

              <a href={"/guest/register"}>Register</a>

          </div>

      </main>
        <footer className={styles.footer}>
            <p>lol</p>
            <a href={"/user/home"}>Home</a>
        </footer>
    </div>
  );
}

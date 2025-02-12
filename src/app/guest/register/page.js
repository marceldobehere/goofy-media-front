'use client';

import styles from "./page.module.css";
import {useState, useEffect} from 'react';
import {generateKeys} from "@/lib/rsa";
import {downloadTextFile} from "@/lib/downloadUtils";
import {hashString, userHash} from "@/lib/cryptoUtils";
import {compress} from "@/lib/strcomp";

export default function Home() {
    const [state, setState] = useState({
        selection: "server",
        server: "http://localhost:3000",
        username: "",
        password: "",
        repeatPassword: "",
        keys: {
            publicKey: "",
            privateKey: ""
        },
        registerButtonText: "Register",
    });
    const updateState = (field, value) => {
        setState({...state, [field]: value});
    }
    const [uHash, setUHash] = useState("");

    async function registerLocal() {
        updateState("registerButtonText", "Registering");
        if (state.keys.publicKey === "" || state.keys.privateKey === "") {
            alert("Please generate a keypair first!");
            return updateState("registerButtonText", "Register");
        }

        let hash = await userHash(state.keys.publicKey);
        console.log("Hash 2:", hash);

        alert("Registering locally: " + JSON.stringify(state));

        updateState("registerButtonText", "Register");
    }

    async function registerServer() {
        updateState("registerButtonText", "Registering");
        alert("Registering on server: " + JSON.stringify(state));


        updateState("registerButtonText", "Register");
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Goofy Media</h1>

                <div className={"container"}>
                    <h2>Register</h2>

                    <p className={"cont-inp-header"}>Server Domain</p>
                    <input value={state.server} className={"cont-inp"} onChange={(e) => {
                        updateState("server", e.target.value)
                    }}></input><br/>

                    <select value={state.selection} className={"cont-inp"} onChange={(e) => {
                        updateState("selection", e.target.value);
                    }}>
                        <option value="local">Store Keys Locally</option>
                        <option value="server">Store Keys On Server</option>
                    </select><br/>

                    {(state.selection === "server") ? (<>
                        <p className={"cont-inp-header"}>Username</p>
                        <input value={state.username} className={"cont-inp"} onChange={(e) => {
                            updateState("username", e.target.value)
                        }}></input><br/>

                        <p className={"cont-inp-header"}>Password</p>
                        <input value={state.password} type={"password"} className={"cont-inp"} onChange={(e) => {
                            updateState("password", e.target.value)
                        }}></input><br/>

                        <p className={"cont-inp-header"}>Check Password</p>
                        <input value={state.repeatPassword} type={"password"} className={"cont-inp"} onChange={(e) => {
                            updateState("repeatPassword", e.target.value)
                        }}></input><br/>
                    </>) : (<>
                        <p className={"cont-inp-header"}>Public Key</p>
                        <input value={state.keys.publicKey} readOnly={true} disabled
                               className={"cont-inp"}></input><br/>

                        <p className={"cont-inp-header"}>Private Key</p>
                        <input value={state.keys.privateKey} readOnly={true} disabled type={"password"}
                               className={"cont-inp"}></input><br/>

                        <p className={"cont-inp-header"}>Username: </p>
                        <input value={uHash} readOnly={true} disabled
                               className={"cont-inp"}></input><br/>

                        <button className={"cont-inp-btn"}
                                onClick={async () => {
                                    let keys = await generateKeys(1024);
                                    updateState("keys", keys);

                                    let hash = await userHash(keys.publicKey);
                                    setUHash(hash);
                                }}>Generate Keypair
                        </button>
                        &nbsp;
                        <button className={"cont-inp-btn"}
                                onClick={async () => {

                                    downloadTextFile(JSON.stringify({
                                        server: state.server,
                                        publicKey: state.keys.publicKey,
                                        privateKey: state.keys.privateKey
                                    }), "personal-keys.json");

                                }}>Download Keypair
                        </button>
                        <br/>
                    </>)}


                    <input type="button" value={state.registerButtonText} className={"cont-btn"}
                           onClick={(state.selection === "server") ? registerServer : registerLocal}></input>
                    <a href={"/guest/login"}>Login</a>

                </div>
            </main>
            <footer className={styles.footer}>
                <p>lol</p>
                <a href={"/"}>Home</a>
            </footer>
        </div>
    );
}

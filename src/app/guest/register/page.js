'use client';

import styles from "./page.module.css";
import {useState, useEffect} from 'react';
import {decryptObj, encryptObj, generateKeys, GLOB_KEY } from "@/lib/rsa";
import {downloadTextFile, fileToString, uploadData} from "@/lib/fileUtils";
import {hashString, userHash} from "@/lib/cryptoUtils";
import {compress} from "@/lib/strcomp";
import {baseServer, getWithAuth, postWithAuth} from "@/lib/req";

export default function Home() {
    const [state, setState] = useState({
        selection: "server",
        server: baseServer,
        username: "",
        password: "",
        repeatPassword: "",
        keys: {
            publicKey: "",
            privateKey: ""
        },
        registerButtonText: "Register",
        showKeys: false,
        firstGen: false,
    });
    const updateState = (field, value) => {
        setState((oldState) => {
            // console.log("> Update OBJ: ", JSON.parse(JSON.stringify({...oldState, [field]: value})));
            return {...oldState, [field]: value};
        });
    }
    const [uHash, setUHash] = useState("");

    async function registerLocal() {
        updateState("registerButtonText", "Registering");
        if (state.keys.publicKey === "" || state.keys.privateKey === "" || uHash === "") {
            alert("Please generate a keypair first!");
            return updateState("registerButtonText", "Register");
        }

        // g4qwy6snld73cut
        let res = await postWithAuth("/guest/register/code", {code:"ncyig8n7f7t0n2h"});
        if (res === undefined) {
            alert("Failed to register locally!");
            return updateState("registerButtonText", "Register");
        }
        console.log("> Reply: ", res);

        res = await postWithAuth("/guest/register/login-test", {});
        if (res === undefined) {
            alert("Login test failed!");
            return updateState("registerButtonText", "Register");
        }
        console.log("> Reply: ", res);


        alert("Registering locally: " + JSON.stringify(state));

        updateState("registerButtonText", "Register");
    }

    async function registerServer() {
        updateState("registerButtonText", "Registering");
        if (state.keys.publicKey === "" || state.keys.privateKey === "" || state.username === "") {
            alert("Please generate a keypair first!");
            return updateState("registerButtonText", "Register");
        }

        // const res = await postWithAuth("/guest/register/login-test", {});
        // console.log("> Reply: ", res);

        alert("Registering on server: " + JSON.stringify(state));

        updateState("registerButtonText", "Register");
    }

    async function genKeys() {
        updateState("keys", {publicKey: "", privateKey: ""});
        setUHash("");

        let keys = await generateKeys();
        updateState("keys", keys);
        GLOB_KEY.privateKey = keys.privateKey;
        GLOB_KEY.publicKey = keys.publicKey;

        // let reply = await postWithAuth("/users", {"test": "abc"});
        // reply = await postWithAuth("/users", {"test": "abc"});
        // console.log("> Reply: ", reply);
        //
        // setTimeout(() => {
        //     postWithAuth("/users", {"test": "abc1"});
        //     postWithAuth("/users", {"test": "abc2"});
        //     postWithAuth("/users", {"test": "abc3"});
        //     postWithAuth("/users/test", {"test": "abc5"});
        //     postWithAuth("/users/test", {"test": "abc6"});
        //     postWithAuth("/users/test", {"test": "abc7"});
        //     postWithAuth("/users/test2", {"test": "abc5"});
        //     postWithAuth("/users/test2", {"test": "abc6"});
        //     postWithAuth("/users/test2", {"test": "abc7"});
        //     postWithAuth("/users/test2", {"test": "abc5"});
        //     postWithAuth("/users/test2", {"test": "abc6"});
        //     postWithAuth("/users/test2", {"test": "abc7"});
        //     getWithAuth("/users/test");
        //     getWithAuth("/users/test");
        //     getWithAuth("/users/test");
        // }, 3000);


        let hash = await userHash(keys.publicKey);
        setUHash(hash);

        console.log("test");
        const t1 = "Hello, world!";
        const e1 = await encryptObj(t1, keys.publicKey);
        console.log("Encrypted:", e1);
        const d1 = await decryptObj(e1, keys.privateKey);
        console.log("Decrypted:", d1);
        if (d1 !== t1) {
            alert("Decryption failed!");
        } else {
            console.log("Decryption success!");
        }
    }

    function canRegister() {
        if (state.server === "" ||
            state.keys.publicKey === "" ||
            state.keys.privateKey === "" ||
            uHash === "")
            return false;

        if (state.selection === "server") {
            return state.username !== "" &&
                state.password !== "" &&
                state.repeatPassword !== "" &&
                state.password === state.repeatPassword;
        } else {
            return true;
        }
    }

    useEffect(() => {
        if (state.firstGen === false) {
            let url = new URL(window.location.href);
            let server = url.searchParams.get("server");
            if (server !== null) {
                updateState("server", server);
            }

            console.log("Generating keys");
            updateState("firstGen", true);
            genKeys().then();
        } else {
            console.log("Keys already generated");
        }
    }, []);

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

                        <p className={"cont-inp-header"}>Show Key Details: <input value={state.showKeys}
                                                                                  type={"checkbox"} onChange={(e) => {
                            updateState("showKeys", e.target.checked)
                        }}></input></p><br></br>
                    </>) : (<>

                    </>)}


                    {(state.showKeys || state.selection === "local") ? (<>
                        <p className={"cont-inp-header"}>Public Key</p>
                        <input value={state.keys.publicKey} readOnly={true} disabled
                               className={"cont-inp"}></input><br/>

                        <p className={"cont-inp-header"}>Private Key</p>
                        <input value={state.keys.privateKey} readOnly={true} disabled type={"password"}
                               className={"cont-inp"}></input><br/>
                    </>) : (<></>)}

                    <p className={"cont-inp-header"}>Generated Handle: </p>
                    <input value={(uHash === "") ? "" : ("@" + uHash)} readOnly={true} disabled
                           className={"cont-inp"}></input><br/>

                    {(state.showKeys || state.selection === "local") ? (<>
                        <button className={"cont-inp-btn"}
                                onClick={genKeys}>Generate Keypair
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
                        &nbsp;
                        <button className={"cont-inp-btn"}
                                onClick={async () => {
                                    try {
                                        let files = await uploadData();
                                        if (files === undefined || files.length < 1)
                                            return;
                                        console.log(files);
                                        let fileStr = await fileToString(files[0]);
                                        console.log(fileStr);

                                        let obj = JSON.parse(fileStr);
                                        console.log(obj);

                                        let server = obj.server;
                                        let publicKey = obj.publicKey;
                                        let privateKey = obj.privateKey;
                                        if (server === undefined || publicKey === undefined || privateKey === undefined)
                                            return alert("Invalid keypair file!");

                                        updateState("server", server);
                                        updateState("keys", {publicKey: publicKey, privateKey: privateKey});

                                        let hash = await userHash(publicKey);
                                        setUHash(hash);
                                    } catch (e) {
                                        alert("Error uploading keypair: " + e.message);
                                    }
                                }}>Upload Keypair
                        </button>
                        <br/>
                    </>) : (<></>)}

                    <input disabled={!canRegister()} type="button" value={state.registerButtonText} className={"cont-btn"}
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

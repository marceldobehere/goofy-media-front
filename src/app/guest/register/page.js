'use client';

import styles from "./page.module.css";
import {useState, useEffect} from 'react';
import {generateKeys} from "@/lib/rsa";
import {downloadTextFile, fileToString, uploadData} from "@/lib/fileUtils";
import {decryptSymm, encryptSymm, hashString, userHash} from "@/lib/cryptoUtils";
import {getNoAuth, postWithAuth} from "@/lib/req";
import {GlobalStuff, initGlobalState, saveGlobalState} from "@/lib/globalStateStuff";
import MainFooter from "@/comp/mainFooter";
import Link from "next/link";
import {goPath} from "@/lib/goPath";
import {usePathname} from "next/navigation";
import {fixServerUrl} from "@/lib/utils";

export default function Register() {
    const pathName = usePathname();
    const [state, setState] = useState({
        selection: "server",
        server: "",
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


    useEffect(() => {
        initGlobalState(pathName, false, false, async () => {
            updateState("server", GlobalStuff.server);
        });
    })

    async function registerLocal() {
        updateState("registerButtonText", "Registering");
        if (state.keys.publicKey === "" || state.keys.privateKey === "" || uHash === "") {
            alert("Please generate a keypair first!");
            return updateState("registerButtonText", "Register");
        }

        state.server = fixServerUrl(state.server);
        updateState("server", state.server);

        GlobalStuff.publicKey = state.keys.publicKey;
        GlobalStuff.privateKey = state.keys.privateKey;
        GlobalStuff.userId = uHash;
        GlobalStuff.server = state.server;

        const code = prompt("Enter the registration code.\nIf you don't have one and want to register, send me a message!");
        if (code === null || code === "") {
            return updateState("registerButtonText", "Register");
        }

        let res = await postWithAuth("/guest/register/code", {code: code});
        if (res === undefined) {
            alert("Failed to register locally!");
            return updateState("registerButtonText", "Register");
        }

        res = await postWithAuth("/guest/register/login-test", {});
        if (res === undefined) {
            alert("Login test failed!");
            return updateState("registerButtonText", "Register");
        }


        await saveGlobalState(true);
        updateState("registerButtonText", "Register");

        // go to /user/home
        goPath("/user/home")
    }

    async function registerServer() {
        updateState("registerButtonText", "Registering");
        if (state.keys.publicKey === "" || state.keys.privateKey === "" || state.username === "") {
            alert("Please generate a keypair first!");
            return updateState("registerButtonText", "Register");
        }
        if (state.keys.password === "" || state.keys.repeatPassword === "") {
            alert("Please enter a password!");
            return updateState("registerButtonText", "Register");
        }
        if (state.keys.password !== state.keys.repeatPassword) {
            alert("Passwords do not match!");
            return updateState("registerButtonText", "Register");
        }

        state.server = fixServerUrl(state.server);
        updateState("server", state.server);

        GlobalStuff.publicKey = state.keys.publicKey;
        GlobalStuff.privateKey = state.keys.privateKey;
        GlobalStuff.userId = uHash;
        GlobalStuff.server = state.server;
        const usernameHash = await hashString(state.username);
        const passwordHash = await hashString(state.password);
        // console.log("> Hashes: ", usernameHash, passwordHash);

        // check if username available
        const check = await getNoAuth(`/guest/enc/secret-storage/${encodeURIComponent(usernameHash)}`);
        if (check) {
            alert("Username already taken!");
            return updateState("registerButtonText", "Register");
        }

        // Check if already registered
        let res = await postWithAuth("/guest/register/login-test", {});
        if (res === undefined) {
            const code = prompt("Enter the registration code.\nIf you don't have one and want to register, send me a message!");
            if (code === null || code === "") {
                return updateState("registerButtonText", "Register");
            }

            res = await postWithAuth("/guest/register/code", {code: code});
            if (res === undefined) {
                alert("Failed to register locally!");
                return updateState("registerButtonText", "Register");
            }

            res = await postWithAuth("/guest/register/login-test", {});
            if (res === undefined) {
                alert("Login test failed!");
                return updateState("registerButtonText", "Register");
            }
        }

        // Save data in secret storage
        let data = {
            username: state.username,
            publicKey: state.keys.publicKey,
            privateKey: state.keys.privateKey
        };

        let encData = await encryptSymm(data, passwordHash);

        res = await postWithAuth(`/guest/enc/secret-storage`, {data: encData, username: usernameHash});
        if (res === undefined) {
            alert("Failed to store data!");
            return updateState("registerButtonText", "Register");
        }

        {
            res = await getNoAuth(`/guest/enc/secret-storage/${encodeURIComponent(usernameHash)}`);
            if (res === undefined) {
                alert("Failed to get data!");
                return updateState("registerButtonText", "Register");
            }

            const decData = await decryptSymm(res, passwordHash);
        }


        await saveGlobalState(true);
        updateState("registerButtonText", "Register");

        // go to /user/home
        goPath("/user/home")
    }

    async function genKeys() {
        updateState("keys", {publicKey: "", privateKey: ""});
        setUHash("");

        let keys = await generateKeys();
        updateState("keys", keys);

        let hash = await userHash(keys.publicKey);
        setUHash(hash);
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
                        <div style={{width: "fit-content", margin: "auto"}}>
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
                                            let fileStr = await fileToString(files[0]);
                                            let obj = JSON.parse(fileStr);

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
                        </div>
                        <br/>
                    </>) : (<></>)}

                    <input disabled={!canRegister()} type="button" value={state.registerButtonText}
                           className={"cont-btn"}
                           onClick={(state.selection === "server") ? registerServer : registerLocal}></input>
                    <div className={styles.OtherList}>
                        <Link className={"cont-inp-btn"} href={"/guest/login"}>Login</Link>
                        <Link className={"cont-inp-btn"} href={"https://github.com/marceldobehere/goofy-media-front?tab=readme-ov-file#server-rules"} target={"_blank"}>Rules</Link>
                        <button className={"cont-inp-btn"} onClick={async () => {
                            const msg = prompt("Enter a message to send to me, please include a way to contact you lol.");
                            if (msg === null || msg === "")
                                return;

                            GlobalStuff.server = fixServerUrl(state.server);
                            GlobalStuff.publicKey = state.keys.publicKey;
                            GlobalStuff.privateKey = state.keys.privateKey;

                            const res = await postWithAuth('/guest/register/register-msg', {msg: msg}, undefined, true);
                            if (res.status == 200)
                                alert("Message sent!");
                            else
                                alert("Failed to send message: " + await res.text());
                        }}>Request Register Code
                        </button>
                    </div>

                </div>
            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

'use client';

import styles from "@/app/page.module.css";
import {getNoAuth, postWithAuth} from "@/lib/req";
import {useEffect, useState} from "react";
import {checkPrivKeyValid, checkPubKeyValid} from "@/lib/rsa";
import {decryptSymm, hashString, userHash} from "@/lib/cryptoUtils";
import {fileToString, uploadData} from "@/lib/fileUtils";
import {
    GlobalStuff,
    initGlobalState,
    initReadyCallbackList,
    saveGlobalState,
    saveGlobalStateKey
} from "@/lib/globalStateStuff";
import MainFooter from "@/comp/mainFooter";


export default function Login() {
    const [server, setServer] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        initGlobalState(true, async () => {
            setServer(GlobalStuff.server);
            if (GlobalStuff.loggedIn) {
                setUsername(GlobalStuff.publicKey);
                setPassword(GlobalStuff.privateKey);
            }
        });
    })

    async function doLoginViaKeys(server) {
        let res = await postWithAuth("/guest/register/login-test", {});
        if (res === undefined) {
            alert("Login test failed!");
            return;
        }

        await saveGlobalState();

        // go to /user/home
        window.location.href = "/user/home";
    }

    async function doLoginPrep(server, username, password) {
        if (server === "") {
            alert("Server cannot be empty");
            return;
        }
        if (username === "") {
            alert("Username cannot be empty");
            return;
        }
        if (password === "") {
            alert("Password cannot be empty");
            return;
        }

        if (await checkPubKeyValid(username) && await checkPrivKeyValid(password)) {
            GlobalStuff.publicKey = username;
            GlobalStuff.privateKey = password;
            await doLoginViaKeys(server);
        } else {
            const usernameHash = await hashString(username);
            const passwordHash = await hashString(password);

            let res = await getNoAuth(`/guest/enc/secret-storage/${encodeURIComponent(usernameHash)}`);
            if (res === undefined) {
                alert("Failed to get data!");
                return;
            }

            let decData;
            try {
                decData = await decryptSymm(res, passwordHash);

                let pubKey = decData.publicKey;
                let privKey = decData.privateKey;

                if (await checkPubKeyValid(pubKey) && await checkPrivKeyValid(privKey)) {
                    GlobalStuff.publicKey = pubKey;
                    GlobalStuff.privateKey = privKey;
                    await doLoginViaKeys(server);
                } else {
                    alert("Keys incorrect");
                    return;
                }
            } catch (e) {
                alert("Password incorrect");
                return;
            }
        }
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Goofy Media</h1>

                <div className={"container"}>
                    <h2>Login</h2>

                    <p className={"cont-inp-header"}>Server Domain</p>
                    <input value={server} className={"cont-inp"} onChange={(e) => {
                        setServer(e.target.value);
                    }}></input><br/>

                    <p className={"cont-inp-header"}>Username / Public Key</p>
                    <input value={username} type={"username"} className={"cont-inp"} onChange={(e) => {
                        setUsername(e.target.value);
                    }} onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                            const passwordInput = document.getElementById("password-input");
                            if (passwordInput) {
                                passwordInput.focus();
                            }
                        }
                    }}></input><br/>

                    <p className={"cont-inp-header"}>Password / Private Key</p>
                    <input id={"password-input"} value={password} type={"password"} className={"cont-inp"}
                           onChange={(e) => {
                               setPassword(e.target.value);
                           }} onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                            doLoginPrep(server, username, password)
                        }
                    }}></input><br/>

                    <input type="button" defaultValue="Login" className={"cont-btn"} onClick={() => {
                        doLoginPrep(server, username, password)
                    }}></input>

                    <a onClick={async () => {
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

                            setServer(server);
                            setUsername(publicKey);
                            setPassword(privateKey);
                        } catch (e) {
                            alert("Error uploading keypair: " + e.message);
                        }
                    }}>Login via File</a><br/>

                    <a href={"/guest/register"}>Register</a>
                </div>

            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

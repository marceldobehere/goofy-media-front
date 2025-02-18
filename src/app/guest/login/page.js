'use client';

import styles from "@/app/page.module.css";
import {baseServer, getNoAuth, postWithAuth} from "@/lib/req";
import {useState} from "react";
import {checkPrivKeyValid, checkPubKeyValid, GLOB_KEY} from "@/lib/rsa";
import {decryptSymm, hashString, userHash} from "@/lib/cryptoUtils";
import {fileToString, uploadData} from "@/lib/fileUtils";


export default function Home() {
    const [server, setServer] = useState(baseServer);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function doLoginViaKeys(server) {
        let res = await postWithAuth("/guest/register/login-test", {});
        if (res === undefined) {
            alert("Login test failed!");
            return;
        }
        console.log("> Login Reply: ", res);
        alert("Login successful!")
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
        console.log("Doing login: ", server, username, password);

        if (await checkPubKeyValid(username) && await checkPrivKeyValid(password)) {
            alert("Doing Login via Keys")
            GLOB_KEY.publicKey = username;
            GLOB_KEY.privateKey = password;
            await doLoginViaKeys(server);
        } else {
            alert("Doing Login via Username / Password")
            const usernameHash = await hashString(username);
            const passwordHash = await hashString(password);
            // console.log("> Hashes: ", usernameHash, passwordHash);

            let res = await getNoAuth(`/guest/enc/secret-storage/${encodeURIComponent(usernameHash)}`);
            if (res === undefined) {
                alert("Failed to get data!");
                return;
            }

            let decData;
            try {
                decData = await decryptSymm(res, passwordHash);
                console.log("> Decrypted: ", decData);

                let pubKey = decData.publicKey;
                let privKey = decData.privateKey;

                if (await checkPubKeyValid(pubKey) && await checkPrivKeyValid(privKey)) {
                    GLOB_KEY.publicKey = pubKey;
                    GLOB_KEY.privateKey = privKey;
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
            <footer className={styles.footer}>
                <p>lol</p>
                <a href={"/user/home"}>Home</a>
            </footer>
        </div>
    );
}

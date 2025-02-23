'use client';

import Link from "next/link";
import styles from "./page.module.css";

const getJSEncrypt = async () => {
    let JSEncrypt = (await import("@/lib/jsencrypt.min")).default
    console.log("JSEncrypt loaded: ", JSEncrypt)

    return new JSEncrypt({default_key_size: 2048});
}

export default function Home() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Encryption Test</h1>

                <p>Public Key:</p>
                <textarea id="publicKey" rows="10" cols="50"></textarea>
                <br></br>

                <p>Private Key:</p>
                <textarea id="privateKey" rows="10" cols="50"></textarea>
                <br></br>

                <p>Message:</p>
                <textarea id="message" rows="10" cols="50"></textarea>
                <br></br>

                <p>Encrypted:</p>
                <textarea id="encrypted" rows="10" cols="50"></textarea>
                <br></br>

                <br></br>


                {/* Generate Keys */}
                <button onClick={async () => {
                    // const JSEncrypt = (await import("../lib/jsencrypt.min.js")).default
                    const encrypt = await getJSEncrypt();
                    const publicKey = encrypt.getPublicKey();
                    const privateKey = encrypt.getPrivateKey();
                    console.log("Public Key:", publicKey);
                    console.log("Private Key:", privateKey);
                    document.getElementById("publicKey").value = publicKey;
                    document.getElementById("privateKey").value = privateKey;
                }}>Generate Keys
                </button>
                <br></br>


                {/* Encrypt / Decrypt */}
                <button onClick={async () => {
                    const publicKey = document.getElementById("publicKey").value;
                    const privateKey = document.getElementById("privateKey").value;
                    const message = document.getElementById("message").value;
                    const encrypted = document.getElementById("encrypted").value;

                    // const JSEncrypt = (await import("/src/app/lib/jsencrypt.min")).default
                    const encrypt = await getJSEncrypt();

                    if (encrypted === "") {
                        encrypt.setPublicKey(publicKey);
                        const encryptedMessage = encrypt.encrypt(message);
                        console.log("Encrypted:", encryptedMessage);
                        document.getElementById("encrypted").value = encryptedMessage;
                        document.getElementById("message").value = "";
                    }
                    else {
                        encrypt.setPrivateKey(privateKey);
                        const decryptedMessage = encrypt.decrypt(encrypted);
                        console.log("Decrypted:", decryptedMessage);
                        document.getElementById("message").value = decryptedMessage;
                        document.getElementById("encrypted").value = "";
                    }
                }}>En/Decrypt
                </button>


            </main>
            <footer className={styles.footer}>
                <p>lol</p>
                <Link href={"/"}>Home</Link>
            </footer>
        </div>
    );
}

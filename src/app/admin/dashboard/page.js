'use client';

import styles from "./page.module.css";
import {GlobalStuff, initGlobalState} from "@/lib/globalStateStuff";
import {useEffect, useState} from "react";
import MainFooter from "@/comp/mainFooter";
import {deleteWithAuth, getWithAuth, postWithAuth} from "@/lib/req";
import Link from "next/link";
import {goPath} from "@/lib/goPath";
import {usePathname} from "next/navigation";
import {downloadTextFile, fileToString, uploadData} from "@/lib/fileUtils";

export default function Home() {
    const pathName = usePathname();

    async function loadCodes() {
        let res = await getWithAuth("/admin/codes", {});
        if (res === undefined)
            return alert("Failed to get codes");
        setCodes(res);
    }

    async function deleteCode(code) {
        let res = await deleteWithAuth(`/admin/codes/${code}`);
        if (res === undefined)
            return alert("Failed to delete code");
        setCodes(res);
    }

    async function exportAllData() {
        // Get from server endpoint
        const data = await getWithAuth("/admin/export");
        if (data === undefined)
            return alert("Failed to get export data");

        // download as text file
        console.log("Exported Data: ", data);
        downloadTextFile(JSON.stringify(data), "full-data-export.json");
    }

    async function importAllData() {
        // ask for file input and read all text
        const files = await uploadData();
        if (files === undefined || files.length === 0)
            return console.log("No files selected");
        const file = files[0];
        const fileData = await fileToString(file);
        const data = JSON.parse(fileData);
        console.log("Imported Data: ", data);

        // Send to server endpoint
        const res = await postWithAuth("/admin/export", data);
        if (res === undefined)
            return alert("Failed to import data");
        alert("Imported data");
    }

    useEffect(() => {
        initGlobalState(pathName, true, true, async () => {
            if (!GlobalStuff.loggedIn)
                return goPath("/guest/login");
            if (!GlobalStuff.admin)
                return goPath("/user/home");
            loadCodes();
        });
    })

    let [codes, setCodes] = useState([]);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Admin Dashboard</h1>

                <Link href={"/guest/login"}>Login</Link><br/>
                <Link href={"/guest/register"}>Register</Link><br/>
                <Link href={"/user/home"}>Home</Link><br/>

                <br/><br/><br/>

                <h2>Complete Data Export/Import</h2>
                <div style={{border: "2px solid blue", margin: "auto", width: "max-content"}}>
                    <button style={{padding: "5px", margin: "5px"}} onClick={exportAllData}>Export all Data</button>
                    <button style={{padding: "5px", margin: "5px"}} onClick={importAllData}>Import all Data</button>
                </div>


                <br/><br/><br/>

                <div style={{border: "2px solid red"}}>
                    <h2>Code List</h2>

                    <div style={{display: "block", margin: "auto", width: "max-content"}}>
                        <button style={{padding: "5px", margin: "5px"}} onClick={async () => {
                            setCodes([]);
                            loadCodes();
                        }}>List codes
                        </button>

                        <button style={{padding: "5px", margin: "5px"}} onClick={async () => {
                            // ask if code should be for admin or user
                            let prompt = window.prompt("Admin or User code?", "user");
                            if (prompt == undefined || prompt == "")
                                return;
                            prompt = prompt.toLowerCase();
                            if (prompt !== "admin" && prompt !== "user")
                                return alert("Invalid input");
                            const admin = prompt === "admin";

                            let res = await postWithAuth("/admin/codes/", {admin});
                            if (res === undefined)
                                return alert("Failed to generate code");
                            console.log(res);

                            alert("Generated code: " + res.code);
                            loadCodes();
                        }}>Generate new code
                        </button>
                    </div>


                    <h3>Unused</h3>
                    <ul>
                        {codes.filter((code) => !code.used).map((code, i) => {
                            const admin = code.admin ? "Admin" : "User";
                            const used = code.used ? "Used" : "Not Used";
                            const usedBy = (code.usedBy == undefined) ? "N/A" : `@${code.usedBy}`;
                            const createdAt = (code.createdAt == undefined) ? "N/A" : new Date(code.createdAt).toLocaleString();
                            const usedAt = (code.usedAt == undefined) ? "N/A" : new Date(code.usedAt).toLocaleString();
                            return <li key={i}>
                                {code.code} - {admin} - {used} - {usedBy} - Created: {createdAt} -
                                Used: {usedAt} &nbsp; &nbsp;{(code.used) ? <></> : <button onClick={() => {
                                deleteCode(code.code)
                            }}>Delete</button>}
                            </li>
                        })}
                    </ul>
                    <br/>
                    <h3>Used</h3>
                    <ul>
                        {codes.filter((code) => code.used).map((code, i) => {
                            const admin = code.admin ? "Admin" : "User";
                            const used = code.used ? "Used" : "Not Used";
                            const usedBy = (code.usedBy == undefined) ? "N/A" : `@${code.usedBy}`;
                            const createdAt = (code.createdAt == undefined) ? "N/A" : new Date(code.createdAt).toLocaleString();
                            const usedAt = (code.usedAt == undefined) ? "N/A" : new Date(code.usedAt).toLocaleString();
                            return <li key={i}>
                                {code.code} - {admin} - {used} - {usedBy} - Created: {createdAt} - Used: {usedAt}
                            </li>
                        })}
                    </ul>
                    <br/>
                </div>

            </main>

            <MainFooter></MainFooter>
        </div>
    );
}

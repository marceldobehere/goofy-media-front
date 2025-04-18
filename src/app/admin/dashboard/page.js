'use client';

import styles from "./page.module.css";
import {GlobalStuff, useGlobalState} from "@/lib/globalStateStuff";
import {useState} from "react";
import {deleteWithAuth, getWithAuth, postWithAuth} from "@/lib/req";
import Link from "next/link";
import {basePath, goPath} from "@/lib/goPath";
import {usePathname} from "next/navigation";
import {downloadTextFile, fileToString, uploadData} from "@/lib/fileUtils";
import UnifiedMenu from "@/comp/unified_layout/unifiedMenu";
import {getProfileUrl} from "@/lib/publicInfo/links";

export default function Home() {
    const pathName = usePathname();
    let [codes, setCodes] = useState([]);

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

    useGlobalState(pathName, true, false, async () => {
        if (!GlobalStuff.loggedIn)
            return goPath("/guest/login");
        if (!GlobalStuff.admin)
            return goPath("/user/home");
        loadCodes();
    });

    return <UnifiedMenu
        divSizes={{left: "20vw", main: "60vw", right: "20vw"}}
        mainDivData={
            <div className={styles.MainContent}>
                <h1>Admin Dashboard</h1>
                <br/>

                <h2>Complete Data Export/Import</h2>
                <div style={{border: "2px solid blue", margin: "auto", width: "max-content"}}>
                    <button style={{padding: "5px", margin: "5px"}} onClick={exportAllData}>Export all Data</button>
                    <button style={{padding: "5px", margin: "5px"}} onClick={importAllData}>Import all Data</button>
                </div>


                <br/><br/>
                <div>
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

                    <br/><br/>
                    <h3>Unused</h3>
                    <ul className={styles.CodeList}>
                        {codes.filter((code) => !code.used).map((code, i) => {
                            const admin = code.admin ? "Admin" : "User";
                            const createdAt = new Date(code.createdAt).toLocaleString();
                            return <li key={i}>
                                <span className={styles.Code}>{code.code}</span> - {admin}
                                <span className={styles.SillySpace}/>
                                Created: {createdAt}
                                <span className={styles.SillySpace}/>
                                <button onClick={() => {
                                    deleteCode(code.code)
                                }}>Delete
                                </button>
                            </li>
                        })}
                    </ul>

                    <br/>
                    <h3>Used</h3>
                    <ul className={styles.CodeList}>
                        {codes.filter((code) => code.used).map((code, i) => {
                            const admin = code.admin ? "Admin" : "User";
                            const usedBy = <a href={getProfileUrl(code.usedBy)} style={{textDecoration: "none"}}>@{code.usedBy}</a>;
                            const createdAt = new Date(code.createdAt).toLocaleString();
                            const usedAt = new Date(code.usedAt).toLocaleString();
                            return <li key={i}>
                                <span className={styles.Code}>{code.code}</span> - {admin}
                                <span className={styles.SillySpace}/>
                                {usedBy}
                                <br/>
                                Created: {createdAt} - Used: {usedAt}
                            </li>
                        })}
                    </ul>
                    <br/>
                </div>
            </div>
        }
    />;
}

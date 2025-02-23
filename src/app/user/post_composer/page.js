'use client';

import styles from "./page.module.css";
import {GlobalStuff, initGlobalState} from "@/lib/globalStateStuff";
import {useEffect, useState} from "react";
import MainFooter from "@/comp/mainFooter";
import {signObj} from "@/lib/rsa";
import {postWithAuth} from "@/lib/req";
import {goPath} from "@/lib/goPath";
import {usePathname} from "next/navigation";

export default function Home() {
    const pathName = usePathname();
    useEffect(() => {
        initGlobalState(pathName, true, false, async () => {
            if (!GlobalStuff.loggedIn)
                goPath("/guest/login")
        });
    })

    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [tagStr, setTagStr] = useState("");

    function parseTags() {
        let tagList = tagStr.split(",");
        let tagList2 = [];
        for (let i = 0; i < tagList.length; i++) {
            let tag = tagList[i].trim();
            if (tag !== "") {
                tagList2.push(tag);
            }
        }
        return tagList2;
    }

    async function getPostObj() {
        if (title === "") {
            alert("Title cannot be empty");
            return;
        }
        if (text === "") {
            alert("Text cannot be empty");
            return;
        }
        let tags = parseTags();
        console.log(tags);

        const postBody = {
            title: title,
            text: text,
            tags: tags,
            createdAt: Date.now()
        };

        const signature = await signObj(postBody);

        const mainBody = {
            post: postBody,
            signature: signature,
            publicKey: GlobalStuff.publicKey,
            userId: GlobalStuff.userId
        }

        return mainBody;
    }

    async function checkPost(dontSay) {
        const postObj = await getPostObj();
        if (postObj === undefined)
            return;
        console.log(postObj);

        const res = await postWithAuth("/user/post/verify", {post: postObj});
        if (res === undefined) {
            alert("Failed to verify post");
            return;
        }

        const valid = res.valid;
        console.log(valid, dontSay)
        if (valid) {
            if (!dontSay)
                alert("Post is valid");
            return true;
        }

        alert("Post is invalid")
        return false;
    }

    async function attemptPost() {
        const postObj = await getPostObj();
        if (postObj === undefined)
            return;

        const res = await postWithAuth("/user/post/", {post: postObj});
        if (res === undefined) {
            alert("Failed to post");
            return;
        }

        goPath("/user/home");
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Post Composer</h1>

                <div className={"container"}>
                    <h2>Create Post</h2>

                    <p className={"cont-inp-header"}>Title</p>
                    <input placeholder={"Cool Title"} value={title} className={"cont-inp"} onChange={(e) => {
                        setTitle(e.target.value);
                    }}></input><br/>

                    <textarea placeholder={"Enter Cool Text"} value={text} className={"cont-inp"}
                              style={{resize: "vertical", minHeight: "80px", maxHeight: "400px"}} onChange={(e) => {
                        setText(e.target.value);
                    }}></textarea>

                    <p className={"cont-inp-header"}>Tags</p>
                    <input placeholder={"cool, post, amazing"} value={tagStr} className={"cont-inp"}
                           onChange={(e) => {
                               setTagStr(e.target.value);
                           }} onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                            attemptPost();
                        }
                    }}></input><br/>

                    <div style={{display: "block", width:"max-content", margin: "auto", padding: "5px 10px 5px 10px"}}>
                        <button className={"cont-inp-btn"}
                                style={{padding: "5px 10px 5px 10px", margin:"5px 10px 5px 10px"}}
                                onClick={() => {checkPost()}}>Check
                        </button>
                        <button className={"cont-inp-btn"}
                                style={{padding: "5px 10px 5px 10px", margin:"5px 10px 5px 10px"}}
                                onClick={attemptPost}>Post
                        </button>
                    </div>
                </div>

            </main>
            <MainFooter></MainFooter>
        </div>
    );
}

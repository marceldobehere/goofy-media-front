'use client';

import styles from "./page.module.css";
import {GlobalStuff, useGlobalState} from "@/lib/globalStateStuff";
import {useRef, useState} from "react";
import {signObj} from "@/lib/rsa";
import {postWithAuth, putWithAuth, rawPostWithAuth} from "@/lib/req";
import {goPath} from "@/lib/goPath";
import {usePathname} from "next/navigation";
import PostEntry from "@/app/user/home/entries/postEntry";
import UnifiedMenu from "@/comp/unified_layout/unifiedMenu";
import {
    getDisplayNameFromUserId,
    getUserPfpFromUserId,
    uploadMediaToServer
} from "@/lib/publicInfo/publicInfoUtils";
import {getSimilarTags} from "@/lib/post/postUtils";
import {convertTextWithEmojis} from "@/lib/emoji/emojiUtils";

export default function Home() {
    const pathName = usePathname();
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [tagStr, setTagStr] = useState("");
    const [showEdit, setShowEdit] = useState(true);
    const [displayName, setDisplayName] = useState();
    const [pfpUrl, setPfpUrl] = useState();
    const [tagSearchRes, setTagSearchRes] = useState(undefined);
    const [tagSearchHide, setTagSearchHide] = useState(true);
    const timeoutId = useRef(undefined);

    useGlobalState(pathName, true, false, async () => {
        if (!GlobalStuff.loggedIn)
            goPath("/guest/login")

        setDisplayName(await getDisplayNameFromUserId(GlobalStuff.userId));
        setPfpUrl(await getUserPfpFromUserId(GlobalStuff.userId));
    });

    function parseTags() {
        let tagList = tagStr.split(",");
        let tagList2 = [];
        for (let i = 0; i < tagList.length; i++) {
            let tag = tagList[i].trim();
            // remove any # and .
            tag = tag.replaceAll("#", "");
            tag = tag.replaceAll(".", "");
            tag = tag.toLowerCase();

            if (tag !== "")
                if (!tagList2.includes(tag))
                    tagList2.push(tag);
        }
        return tagList2.sort();
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
            return false;
        console.log(postObj);

        const res = await postWithAuth("/user/post/verify", {post: postObj});
        if (res === undefined) {
            alert("Failed to verify post");
            return false;
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

        const checked = await checkPost(true);
        if (!checked)
            return;

        const res = await postWithAuth("/user/post/", {post: postObj});
        if (res === undefined) {
            alert("Failed to post");
            return;
        }

        goPath("/user/home");
    }

    const toggleEdit = () => {
        setShowEdit(!showEdit);
    }

    // Using My server that uses https://catbox.moe to upload files
    // POST /user/upload/file
    async function uploadMedia(files) {
        if (!confirm("The uploaded file will not be hosted on goofy media, instead it will be hosted on https://catbox.moe\nIt may disappear at some point or not work!\nIf you want to upload the file, press OK."))
            return;

        const res = await uploadMediaToServer(files);
        if (res == undefined)
            return;

        setText(text + `\n![${res.filename}](${res.url})`);
    }

    function getEdit() {
        return (<>
            <p className={"cont-inp-header"}>Title</p>
            <input placeholder={"Cool Title"} value={title} className={"cont-inp"} onChange={(e) => {
                setTitle(e.target.value);
            }}></input><br/>

            <textarea placeholder={"Enter Cool Text"} value={text} className={"cont-inp"}
                      style={{resize: "vertical", height: "200px", minHeight: "80px", maxHeight: "600px"}}
                      onChange={(e) => {
                          setText(e.target.value);
                      }}
                      onDrop={(e) => {
                          e.preventDefault();
                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                              console.info(`File dropped in text area`, e);
                              uploadMedia(files).then();
                          }
                      }}
                      onPaste={(e) => {
                          const dT = e.clipboardData || window.clipboardData;
                          const files = dT.files;
                          if (files.length > 0) {
                              console.info(`File pasted in text area`, e);
                              e.preventDefault();
                              uploadMedia(files).then();
                          }
                      }}
            ></textarea>

            <p className={"cont-inp-header"}>Tags</p>
            <div className={styles.TagSearchList}
                 style={{display: (tagSearchRes && !tagSearchHide) ? "block" : "none"}}>
                <div>
                    <ul>
                        {(tagSearchRes || []).map((tag, idx) => (
                            <li key={idx}>
                                <div key={idx} className={styles.TagDiv}>
                                    <a onClick={() => {
                                        const tags = tagStr.split(",");
                                        if (tags.length < 1)
                                            tags.push("");
                                        tags[tags.length - 1] = tag.tag;
                                        for (let i = 0; i < tags.length; i++) {
                                            tags[i] = tags[i].trim();
                                            if (tags[i] === "") {
                                                tags.splice(i, 1);
                                                i--;
                                            }
                                        }
                                        setTagStr(tags.join(", ") + ", ");
                                        setTagSearchRes(undefined);

                                        const elem = document.getElementById("tagListYes");
                                        if (elem)
                                            elem.focus();
                                    }}>#{tag.tag}</a> ({tag.count})
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <input id={"tagListYes"} placeholder={"cool, post, amazing"} value={tagStr} className={"cont-inp"}
                   onBlur={(e) => {
                       setTimeout(() => {
                           setTagSearchHide(true);
                       }, 150);
                   }}
                   onFocus={(e) => {
                       setTagSearchHide(false);
                       setTimeout(() => {
                           setTagSearchHide(false);
                       }, 200);
                   }}
                   onChange={(e) => {
                       setTagStr(e.target.value);

                       const tags = e.target.value.split(",");
                       if (tags.length < 1)
                           tags.push("");

                       const lastTag = tags[tags.length - 1].trim();

                       const timeOutId = setTimeout(async () => {
                           if (lastTag.length > 0) {
                               const tags = await getSimilarTags(lastTag);
                               setTagSearchRes(tags)
                           } else {
                               setTagSearchRes(undefined);
                           }
                       }, 100);

                       if (timeoutId.current !== undefined)
                           clearTimeout(timeoutId.current);
                       timeoutId.current = timeOutId;
                   }}
                   onKeyUp={(e) => {
                       if (e.key === 'Escape') {
                           setTimeout(() => {
                               setTagSearchRes(undefined);
                           }, 50);
                       }
                   }}
                   onKeyDown={(e) => {
                       // check if tab pressed
                       if (e.key === 'Tab') {
                           e.preventDefault();
                           if (tagSearchRes == undefined || tagSearchRes.length < 1) {
                               if (!tagStr.endsWith(" "))
                                   setTagStr(tagStr + ", ");

                               setTagSearchRes(undefined);
                               return;
                           }

                           const tags = tagStr.split(",");
                           if (tags.length < 1)
                               tags.push("");
                           tags[tags.length - 1] = tagSearchRes[0].tag;
                           for (let i = 0; i < tags.length; i++) {
                               tags[i] = tags[i].trim();
                               if (tags[i] === "") {
                                   tags.splice(i, 1);
                                   i--;
                               }
                           }
                           setTagStr(tags.join(", ") + ", ");
                           setTagSearchRes(undefined);
                       }
                   }}
            ></input><br/>

            <div>
                <div className={styles.CreatePostButtons}>
                    <button className={`cont-inp-btn ${styles.CreatePostButtonsBtn}`}
                            onClick={toggleEdit}>Preview
                    </button>
                    <button className={`cont-inp-btn ${styles.CreatePostButtonsBtn}`}
                            onClick={() => {
                                uploadMedia().then()
                            }}>Add Media
                    </button>
                    <button className={`cont-inp-btn ${styles.CreatePostButtonsBtn}`}
                            onClick={attemptPost}>Post
                    </button>
                </div>
                <br/>
                <a style={{textAlign: "center", display: "block", margin: "auto", padding: "5px 10px 5px 10px"}}
                   href={"https://github.com/marceldobehere/goofy-media-front?tab=readme-ov-file#styling-info"}
                   target={"_blank"}>Post Styling</a>
            </div>

            <br/><br/>
        </>);
    }

    function getPreview(livePrev) {
        return (<div className={styles.PostPreviewDiv}>
            <PostEntry post={{
                displayName: async () => (displayName),
                author: GlobalStuff.userId,
                createdAt: Date.now(),
                title: convertTextWithEmojis(title),
                pfpUrl: async () => (pfpUrl),
                text: text,
                tags: parseTags(),
                commentCount: 0,
                valid: async () => ({ok: "true"}),
                likeOverride: true
            }}></PostEntry>

            {livePrev ? "" :
                <div style={{display: "block", width: "max-content", margin: "auto"}}>
                    <button className={`cont-inp-btn ${styles.CreatePostButtonsBtn}`}
                            onClick={toggleEdit}>Edit
                    </button>
                </div>
            }

        </div>);
    }

    return <UnifiedMenu
        divSizes={{left: "20vw", main: "40vw", right: "40vw"}}
        mainDivData={
            <div>
                <h1>Post Composer</h1>

                <div className={styles.MainContainer}>
                    <h2>Create Post</h2>

                    {showEdit ? getEdit() : getPreview()}
                </div>
            </div>
        }

        rightDivData={
            <div>
                <h1>Live Post Preview</h1>

                <div className={styles.MainContainer}>
                    {getPreview(true)}
                </div>
            </div>
        }
    />;
}

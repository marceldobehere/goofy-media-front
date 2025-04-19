'use client';

function getAssistantDiv() {
    return document.getElementById("main-assistant-div");
}

function getAssistantBodyDiv() {
    return document.getElementById("main-assistant-body-div");
}

function toggleBodyVis() {
    const assistantBodyDiv = getAssistantBodyDiv();
    if (assistantBodyDiv === undefined)
        return;
    const hidden = assistantBodyDiv.style.display === "none";

    const assistantDiv = getAssistantDiv();
    if (assistantDiv != undefined)
        assistantDiv.className = hidden ? "assistant-div-active" : "";

    if (hidden) {
        assistantBodyDiv.style.display = "block";
    } else {
        assistantBodyDiv.style.display = "none";
    }
}

function setBodyContent(html) {
    const assistantBodyDiv = getAssistantBodyDiv();
    if (assistantBodyDiv === undefined)
        return;
    assistantBodyDiv.children[0].innerHTML = html;
}


async function assistantNeeded() {
    return true;
}

async function assistantClicked() {

    setBodyContent(`
        <h1>Hello</h1><br>
        This will be the assistant!<br>It will provide information on new features and help new users.<br><br>
        It is still WIP, so don't worry about it <i>for now</i><br><br>
        
        This will be dynamic and stuff later, but for now here are some of the things you should do, if you haven't:<br><br>
        <ul style="margin-left: 1rem;">
            <li>Check out the Rules in the Github Repository</li>
            <li>Maybe Register if you want to</li>
            <li>Set up your Profile in the Profile Settings</li>
            <li>Check out the Local Settings for any interesting settings</li>
            <li>Maybe Set up Discord Notifications in the Local Settings</li>
            <li>Take a look at the Post Composer and look through the Styling Infos</li>
            <li>Make your first Post!</li>
            <li>Look through the Global Feed or maybe Search for something</li>
            <li>Share your Profile Page using the &quot;Smol Link&quot;</li>
            <li>Force your friends to try Goofy Media lol</li>
        </ul>
        <br><br>
        
        That's about it for the assistant right now xd
        
    `);
    toggleBodyVis();
}

export async function initAssistant(pathName) {
    const assistantDiv = getAssistantDiv();
    if (assistantDiv === undefined)
        return;

    assistantDiv.onclick = assistantClicked;

    const assistantBodyDiv = getAssistantBodyDiv();
    if (assistantBodyDiv === undefined)
        return;
    assistantBodyDiv.onclick = assistantClicked;
    assistantBodyDiv.children[0].onclick = (e) => {
        e.stopPropagation();
    };
    assistantBodyDiv.onscroll = (e) => {
        e.stopPropagation();
    };

    assistantDiv.style.display = (await assistantNeeded()) ? "block" : "none";
}
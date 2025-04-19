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
        It is still WIP, so don't worry about it <i>for now</i>
        
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
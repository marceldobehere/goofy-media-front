'use client';

function downloadBase64File(base64DataStr, fileName) {
    const linkSource = base64DataStr;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
}

export function downloadTextFile(str, fileName)
{
    downloadBase64File("data:text/plain;charset=utf-8," + encodeURIComponent(str), fileName);
}

export async function uploadData() {
    return await new Promise((res, rej) => {
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.multiple = true;
        fileInput.onchange = async () => {
            let files = fileInput.files;
            res(files);
        };
        fileInput.onabort = () => {
            res(undefined);
        }
        fileInput.oncancel = () => {
            res(undefined);
        }
        fileInput.onclose = () => {
            res(undefined);
        }
        fileInput.click();
    });
}

export async function fileToString(fileObj) {
    return await new Promise((res, rej) => {
        let reader = new FileReader();
        reader.onload = () => {
            res(reader.result);
        }
        reader.onerror = (e) => {
            rej(e);
        }
        reader.readAsText(fileObj);
    });
}
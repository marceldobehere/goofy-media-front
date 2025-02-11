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
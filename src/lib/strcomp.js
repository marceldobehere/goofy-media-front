'use client';


const getLZ = async () => {
    let lZ = (await import("@/lib/lz-string.min")).default

    return lZ;
}

export async function compress(str) {
    // console.log("compressing: ", str);

    let lZ = await getLZ();

    // compress into base64
    let compressed = lZ.compressToBase64(str);

    return compressed;
}

export async function decompress(b64) {
    // console.log("decompressing: ", b64);

    let lZ = await getLZ();

    // decompress from base64
    let decompressed = lZ.decompressFromBase64(b64);

    return decompressed;
}

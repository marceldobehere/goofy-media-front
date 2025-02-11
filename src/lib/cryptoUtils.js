'use client';


const getCryptoJS = async () => {
    let CryptoJS = (await import("@/lib/crypto_js/crypto-js")).default
    // console.log("CryptoJS loaded: ", CryptoJS)

    return CryptoJS;
}


let hashStringMap = new Map();
export async function hashString(str)
{
    let res = hashStringMap.get(str);
    if (res)
        return res;

    let CryptoJS = await getCryptoJS();

    let hash = CryptoJS.PBKDF2(str, "GoofyHash123", {keySize: 16,iterations: 50000})["words"][0];

    if (hash < 0)
        hash *= -1;

    if (hashStringMap.size > 5_000)
        hashStringMap.clear();

    hashStringMap.set(str, hash);
    return hash;
}

const B64   = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const M64_1 = "bcdfghjklmnptbrstbcdfhwjklb_abcdefghijklmnopqrstuvwxyz_aeioueaeea";
const M64_2 = "aaaee??iiooo???eua??eaoau?i??????????????????????????????????????";

const M64Map = new Map();
for (let i = 0; i < 64; i++)
    M64Map.set(B64[i], M64_1[i] + (M64_2[i] == '?' ? "" : M64_2[i]) );

function transformB64(input) {
    let output = "";
    for (let i = 0; i < input.length; i++)
        output += M64Map.get(input[i]);
    return output;
}


let hashStringMap2 = new Map();
export async function userHash(str)
{
    let res = hashStringMap2.get(str);
    if (res)
        return res;

    let CryptoJS = await getCryptoJS();

    let hash = CryptoJS.PBKDF2(str, "GoofyHash123", {keySize: 16,iterations: 50000}).toString(CryptoJS.enc.Base64);
    hash = hash.substring(0, 10); // 10 * ~6 bit ->  60 bit
    // console.log("Hash 1:", hash);

    hash = transformB64(hash);

    if (hashStringMap2.size > 5_000)
        hashStringMap2.clear();

    hashStringMap2.set(str, hash);
    return hash;
}

export function getRandomIntInclusive(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    for (let i = Math.random() * 25; i >= 0; i--)
        Math.random();

    return Math.floor(Math.random() * (max - min + 1) + min);
}
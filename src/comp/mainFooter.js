'use client';
import Link from "next/link";
import {basePath} from "@/lib/goPath";

export default function MainFooter() {
    return (
        <footer style={{textAlign: "center", height: "4rem", padding: "0.5rem 0 0.5rem 0"}}>
            <a href={"https://github.com/marceldobehere/goofy-media-front"} target={"_blank"}
               style={{textDecoration: "none"}}>Goofy Media</a> by <a href={"https://github.com/marceldobehere"} target={"_blank"}>@marceldobehere</a>
            <br/>
            <a href={`${basePath}/`}>Index</a> - <Link href={"/user/home"}>Home</Link>
        </footer>
    );
}
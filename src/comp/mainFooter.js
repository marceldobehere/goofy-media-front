import Link from "next/link";

export default function MainFooter() {
    return (
        <footer style={{textAlign: "center", height: "3rem", padding: "0.5rem 0 0.5rem 0"}}>
            <a href={"https://github.com/marceldobehere/goofy-media-front"} target={"_blank"} style={{textDecoration: "none"}}>Goofy Media</a> - 2025
            <br/>
            <Link href={"/"}>Index</Link> - <Link href={"/user/home"}>Home</Link>
        </footer>
    );
}
import Link from "next/link";

export default function MainFooter() {
    return (
        <footer style={{textAlign: "center", "height": "50px"}}>
            Goofy Media 2025
            <br/>
            <Link href={"/"}>Index</Link> - <Link href={"/user/home"}>Home</Link>
        </footer>
    );
}
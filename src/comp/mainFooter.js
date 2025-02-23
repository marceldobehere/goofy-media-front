import Link from "next/link";

export default function MainFooter() {
    return (
        <footer style={{textAlign: "center", "height": "50px"}}>
            FOOTER
            <br/>
            <Link href={"/"}>Index</Link> - <Link href={"/user/home"}>Home</Link>
        </footer>
    );
}
import "./globals.css";
import {Dynamic} from "@/comp/testDyn";


export const metadata = {
    title: "Goofy Media",
    description: "Goofy Social Media App",
};

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <head>
            <link rel={"icon"} href={"/goofy-media-front/icon.ico"} sizes={"any"}></link>
        </head>
        <body>
        <div id={"main-loading-div"} style={{display: "none", zIndex: 150}}></div>
        <Dynamic>{children}</Dynamic>
        </body>
        </html>
    );
}

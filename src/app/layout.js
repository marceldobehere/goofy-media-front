// import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";

// const geistSans = Geist({
//     variable: "--font-geist-sans",
//     subsets: ["latin"],
// });
//
// const geistMono = Geist_Mono({
//     variable: "--font-geist-mono",
//     subsets: ["latin"],
// });

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
        <div id={"main-loading-div"} style={{display:"none"}}>

        </div>
        {children}
        </body>
        </html>
    );
}

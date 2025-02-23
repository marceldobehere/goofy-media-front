import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Goofy Media",
    description: "Goofy Social Media App",
};

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div id={"main-loading-div"} style={{position:"absolute", bottom:"20px", right:"20px", width:"40px", height:"40px", overflow:"hidden"}}>

        </div>
        {children}
        </body>
        </html>
    );
}

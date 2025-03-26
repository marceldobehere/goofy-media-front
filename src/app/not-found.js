'use client';
import {usePathname} from "next/navigation";
import {useEffect} from "react";
import {goPath} from "@/lib/goPath";

export default function Custom404() {
    const path = usePathname();
    useEffect(() => {
        if (path == "/") {
            goPath("/")
        }
    }, []);

    return <div>
        <h1>404 - Page Not Found</h1>

        <p>The content you were looking was not found :(</p>
    </div>;
}
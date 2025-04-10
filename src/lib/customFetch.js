'use client';

export function overrideFetch() {
    if (typeof window === "undefined")
        return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        // console.log("> Doing Fetch: ", args);

        try {
            // Doing skip for useless fetch to save 50ms
            if (args != undefined && args.length > 0 && args[0] != undefined) {
                let urlStr = "";
                if (typeof args[0] == "string")
                    urlStr = args[0];
                else if (args[0].url != undefined)
                    urlStr = args[0].url;
                else if (args[0].href != undefined)
                    urlStr = args[0].href;

                if (urlStr.includes("goofy-media-front.txt?_rsc=")) {
                    console.log("> Skipping useless fetch: ", args)

                    return new Response(null, {
                        status: 404,
                        statusText: "Not Found",
                        headers: {
                            "Content-Type": "text/plain"
                        }
                    });
                }
            }
        } catch (e) {
            console.info("> Error in fetch: ", e, args);
        }

        // Potential caching stuff here

        const response = await originalFetch(...args);
        return response;
    };
}
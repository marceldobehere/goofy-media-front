import Link from "next/link";

export const searchButtonMenu = (goToPage, page, firstPage, lastPage) => (
    <div style={{margin: "auto", textAlign: "center"}}>
        <button onClick={() => {
            goToPage(page - 1)
        }} disabled={firstPage}>&lt;- Back
        </button>
        &nbsp;&nbsp;
        <Link href={"/user/home"}>Home</Link>
        &nbsp;&nbsp;
        <button onClick={() => {
            goToPage(page + 1)
        }} disabled={lastPage}>Next -&gt;
        </button>
    </div>
);
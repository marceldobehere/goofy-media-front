export default function EntryList({elements, compFn, extra}) {
    return (
        <ul style={{listStyle: "none"}}>
            {elements.map((post, index) => {
                return (
                    <li key={index}>
                        {compFn(post)}
                    </li>
                );
            })}

            {(extra !== undefined) ? <li key={elements.length}>{extra}</li> : <></>}
        </ul>
    );
}
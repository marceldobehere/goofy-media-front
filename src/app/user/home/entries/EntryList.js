export default function EntryList({elements, compFn, keyFn, extra}) {
    return (
        <ul style={{listStyle: "none"}}>
            {elements.map((post) => {
                return (
                    <li key={keyFn(post)}>
                        {compFn(post)}
                    </li>
                );
            })}

            {(extra !== undefined) ? <li key={"extra-content"}>{extra}</li> : <></>}
        </ul>
    );
}
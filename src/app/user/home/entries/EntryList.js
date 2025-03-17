export default function EntryList({elements, component, extra}) {
    return (
        <ul style={{listStyle: "none"}}>
            {elements.map((post, index) => {
                return (
                    <li key={index}>
                        {component({post})}
                    </li>
                );
            })}

            {(extra !== undefined) ? <li key={elements.length}>{extra}</li> : <></>}
        </ul>
    );
}
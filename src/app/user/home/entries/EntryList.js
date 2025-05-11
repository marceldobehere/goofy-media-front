'use client';
import { memo } from 'react';

function EntryList({elements, compFn, keyFn, extra}) {
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

export default memo(EntryList, (prevProps, nextProps) => {
    const res = JSON.stringify(prevProps.elements) === JSON.stringify(nextProps.elements);
    // console.log("> COMP RENDERING", prevProps.elements, " WITH ", nextProps.elements, " ->", res)
    return res;
});
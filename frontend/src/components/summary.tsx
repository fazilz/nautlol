import React, { useEffect, useState } from "react";

interface Props {
    name: string
}

export const Summary: React.FC<Props> = ({ name }) => {
    const [details, setDetails] = useState<any>({})
    useEffect(() => {
        console.log(name);
        // TODO: replace with backend API call
        setDetails({
            "name": "goredrinker",
            "ad": "45",
            "ability haste": "20",
            "omnivamp": "8%",
            "health": "400"
        });
    }, []);
    const data = (Object.entries(details) as string[][]);
    return (
        <section>
            <ul>
                {data.map(([attribute, value]) => {
                    return (
                        <li className='summary-list'>
                            {!(attribute == "name") && <span className="attribute-name">{attribute}</span>}
                            <span className="attribute-value">{value}</span>
                        </li>);
                })}
            </ul>
        </section>
    )
}
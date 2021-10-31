import React, { useEffect, useState } from "react";


export const All: React.FC = () => {
    const [items, setItems] = useState<string[]>([]);
    useEffect(() => {
        // TODO: remove
        const data = require('../modelData/itemNames.json')
        setItems(data)
    }, []);
    return (
        <div>
            <ul className="all_items">
                {items.map((item, i) => <li className="item_name" key={i}>{item}</li>)}
            </ul>
        </div>
    );
}
import React, { useState, useEffect } from 'react'
import { PatchChange } from '../interfaces/PatchChange';
import { Change } from './change';
import { Summary } from './summary';

interface Props {
    name: string
}

export const Unit: React.FC<Props> = ({ name }) => {
    const [changes, setChanges] = useState<PatchChange[]>([]);
    // const [changes, setChanges] = useState([]);
    useEffect(() => {
        console.log(name)
        const data = require('../modelData/goredrinker.json');
        setChanges(data);
    }, []);
    return (
        <div className='page'>
            <Summary name={name}/>
            <section>
            {changes.map(({ changes, context, patch }, i) => 
                <Change changes={changes} context={context} patch={patch} key={i} />
            )}
            </section>
        </div>
    );
}
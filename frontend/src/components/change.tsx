import React from "react";
import { PatchChange } from "../interfaces/PatchChange";

export const Change: React.FC<PatchChange> = ({
    changes, context, patch
}) => {
    const dashed = patch.replace('.', '-');
    const patch_url = `https://www.leagueoflegends.com/en-us/news/game-updates/patch-${dashed}-notes/#patch-items`
    return (
    <div className='content-border'>
        <a href={patch_url}><h3>{patch}</h3></a>
        <blockquote className='blockquote'>{context}</blockquote>
        {changes.map((change, i) => (
            <div className='attribute-change' key={i}>
                <span className='attribute'>{change.attribute}</span>
                <span className='attribute-before'>{change.before}</span>
                <span>⇒</span>
                <span className='attribute-after'>{change.after}</span>
            </div>
        ))}
    </div>);
}
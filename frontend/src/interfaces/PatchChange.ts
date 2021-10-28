import { AttributeChange } from "./AttributeChange";

export interface PatchChange {
    changes: AttributeChange[],
    context: string,
    patch: string
}

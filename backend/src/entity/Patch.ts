import { prop as Property, getModelForClass } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";

export class Patch {
    readonly _id: ObjectId;
    
    @Property({required: true})
    patch: number;

    @Property({required: true})
    champs: boolean;

    @Property({required: true})
    items: boolean;
}

export const PatchModel = getModelForClass(Patch);


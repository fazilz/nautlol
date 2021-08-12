import { prop as Property, getModelForClass } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, ID, ObjectType } from "type-graphql";
import { Change } from "./Change";

@ObjectType()
export class Unit {

    @Field(()=> ID)
    readonly _id: ObjectId;

    @Field()
    @Property({ required: true })
    title: string;
    
    @Field(() => [Change], { nullable: true})
    @Property()
    patch_changes: Change[];
};

export const UnitModel = getModelForClass(Unit);
import { prop as Property, getModelForClass } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { Attribute } from "./Attribute";

@ObjectType()
export class Unit {

    // @Field(()=> ID)
    // readonly _id: ObjectId;

    @Field()
    @Property({ required: true })
    title: string;
 
    @Field({ nullable: true })
    @Property()
    context: string;

    @Field(() => [Attribute], { nullable: true })
    @Property()
    changes: Attribute[];

    @Field()
    @Property({ required: true })
    patch: number;
};

export const UnitModel = getModelForClass(Unit);
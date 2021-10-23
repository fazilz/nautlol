import { prop as Property, getModelForClass } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";

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

    @Field(() => [String], { nullable: true })
    @Property()
    changes: string[];

    @Field()
    @Property({ required: true })
    patch: number;
};

export const UnitModel = getModelForClass(Unit);
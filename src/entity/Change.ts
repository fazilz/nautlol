import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Change {
    @Field()
    context: string;

    @Field()
    changes: string[];

    @Field()
    patch: string;
};
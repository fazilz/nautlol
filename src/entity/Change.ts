import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Change {
    @Field({ nullable: true })
    context: string;

    @Field(() => [String], { nullable: true })
    changes: string[];

    @Field()
    patch: string;
};

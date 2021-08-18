import { Arg, Query, Resolver } from "type-graphql";
import { Unit, UnitModel } from "../entity/Unit";

@Resolver()
export class UnitResolver {
    @Query(() => [Unit])
    async allUnits() {
        const a = await UnitModel.find();
        console.log(a);
        return a; 
    }

    @Query(() => [Unit])
    async Unit(@Arg("title") title: string){
        return await UnitModel.find({title});
    }
}
import { Query, Resolver } from "type-graphql";
import { Change } from "../entity/Change";
import { Unit, UnitModel } from "../entity/Unit";

@Resolver()
export class UnitResolver {
    @Query(() => [Unit])
    async allUnits() {
        return await UnitModel.find();
    }
}
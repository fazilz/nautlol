import { mongoose } from "@typegoose/typegoose";

const Any = new mongoose.Schema({ any: {} }, { strict: false });
export const ItemModel = mongoose.model('Item', Any);

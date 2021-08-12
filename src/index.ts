import "reflect-metadata";
import { ApolloServer } from 'apollo-server';
import { UnitResolver } from './resolvers/unit'
import mongoose from 'mongoose';
import { buildSchema} from "type-graphql";

const startServer = async () => {
  await mongoose
  .connect("mongodb://127.0.0.1:27017", { useNewUrlParser: true, dbName: 'nautlol', useUnifiedTopology: true})
  .then(()=>{
    console.log('connected to mongodb')
  });

  const schema = await buildSchema({
    resolvers: [UnitResolver]
  });
  const server = new ApolloServer({ schema });
  server.listen().then(({ url } : {url: String}) => {
    console.log(`Server ready at ${url}`);
  });

}

startServer();
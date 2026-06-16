import type { Request, RequestHandler, Response } from "express";
import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { createContext } from "./context.js";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./schema.js";

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export function createGraphQLHandler() {
  const yoga = createYoga<{ req: Request; res: Response }>({
    schema,
    graphqlEndpoint: "/graphql",
    context: ({ req }) => createContext(req),
  });

  return yoga as unknown as RequestHandler;
}

import type { Request, RequestHandler, Response } from 'express';
import { GraphQLError } from 'graphql';
import { createGraphQLError, createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ZodError } from 'zod';

import AppError from '@/helpers/AppError.js';
import { createContext } from './context.js';
import { resolvers } from './resolvers.js';
import { typeDefs } from './schema.js';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

function getOriginalError(error: unknown) {
  if (error instanceof GraphQLError && error.originalError) {
    return error.originalError;
  }

  return error;
}

function maskGraphQLError(error: unknown, message: string) {
  const originalError = getOriginalError(error);

  if (originalError instanceof AppError) {
    return createGraphQLError(originalError.message, {
      extensions: {
        code: 'APP_ERROR',
        http: {
          status: originalError.statusCode,
        },
      },
      originalError,
    });
  }

  if (originalError instanceof ZodError) {
    return createGraphQLError('Request validation failed', {
      extensions: {
        code: 'BAD_USER_INPUT',
        issues: originalError.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
        http: {
          status: 400,
        },
      },
      originalError,
    });
  }

  return createGraphQLError(message, {
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
      unexpected: true,
    },
  });
}

export function createGraphQLHandler() {
  const yoga = createYoga<{ req: Request; res: Response }>({
    schema,
    graphqlEndpoint: '/graphql',
    context: ({ req }) => createContext(req),
    maskedErrors: {
      maskError: maskGraphQLError,
    },
  });

  return yoga as unknown as RequestHandler;
}

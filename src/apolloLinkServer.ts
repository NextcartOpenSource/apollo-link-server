// eslint-disable-next-line import/no-extraneous-dependencies
import { ApolloServer } from "apollo-server-micro";
import {
  ApolloLink,
  FetchResult,
  Observable,
  Operation,
  RequestHandler,
} from "apollo-link";
import { GraphQLError, GraphQLFormattedError, print } from "graphql";

// eslint-disable-next-line import/prefer-default-export
export class ServerLink extends ApolloLink {
  private static formatGraphQLErrors = (
    formattedErrors:
      | Readonly<Array<GraphQLFormattedError<Record<string, any>>>>
      | undefined,
  ): readonly GraphQLError[] | undefined => {
    const errors: GraphQLError[] = [];
    for (const error of formattedErrors ?? []) {
      errors.push({
        extensions: error.extensions,
        locations: error.locations,
        message: error.message,
        name: error.message,
        nodes: undefined,
        originalError: undefined,
        path: error.path,
        positions: error.locations?.map((loc) => loc.line),
        source: undefined,
      });
    }
    return errors.length !== 0 ? errors : undefined;
  };

  constructor(
    private server: ApolloServer,
    private context?: Record<string, any>,
    requestHandler?: RequestHandler,
  ) {
    super(requestHandler);
  }

  public request = (
    operation: Operation,
    _forward: never,
  ): Observable<FetchResult> => {
    return new Observable<FetchResult>((observer) => {
      this.server
        .executeOperation({
          ...operation,
          query: print(operation.query),
        })
        .then((result) => {
          if (!observer.closed) {
            observer.next({
              context: this.context,
              data: result.data,
              errors: ServerLink.formatGraphQLErrors(result.errors),
              extensions: result.extensions,
            });
            observer.complete();
          }
        })
        .catch((e) => !observer.closed && observer.error(e));
    });
  };
}

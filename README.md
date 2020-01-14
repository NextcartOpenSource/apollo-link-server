# apollo-server-link

---

title: apollo-link-server
description: Use an Apollo Server instance to request data.

---

The server link provides a [graphql execution environment](http://graphql.org/graphql-js/graphql/#graphql), which allows you to perform GraphQL operations on a provided server instance. This type of behavior is commonly used for server-side rendering (SSR) to avoid network calls and to unify caching.

## Installation

`npm install @nextcart/apollo-link-server --save`

## Usage

### Server Side Rendering

When performing SSR _on the same server_ you can use this library to avoid making network calls while still benefiting from the cache. [apollo-link-schema](https://www.npmjs.com/package/apollo-link-schema) does not allow for use of the server's cache.

    import { ApolloServer } from 'apollo-server-micro';
    import { ApolloClient } from 'apollo-client';
    import { ServerLink } from '@nextcart/apollo-link-server';

    const apolloServer = new ApolloServer({...})

    const graphqlClient = new ApolloClient({
      ssrMode: true,
      cache: new InMemoryCache(),
      link: new ServerLink(apolloServer)
    });

### Options

The `ServerLink` constructor can be called with an object with the following properties:

- `server`: an [apollo server instance](https://www.npmjs.com/package/apollo-server)
- `context`: (optional) an object passed to the resolvers, following the [graphql specification](http://graphql.org/learn/execution/#root-fields-resolvers) or a function that accepts the operation and returns the resolver context. The resolver context may contain all the data-fetching connectors for an operation.
- `requestHandler`: (optional) A function which receives an `Operation` and a `NextLink` and returns an Observable of an `ExecutionResult`

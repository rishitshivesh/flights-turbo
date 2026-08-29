import {ApolloClient, InMemoryCache, registerApolloClient,} from "@apollo/client-integration-nextjs";
import {HttpLink} from "@apollo/client";

export const {
    getClient,
    query,
} = registerApolloClient(() => {
    return new ApolloClient({
        cache: new InMemoryCache(),

        link: new HttpLink({
            uri:
                process.env.GRAPHQL_API_URL ??
                "http://localhost:4000/graphql",

            fetchOptions: {
                cache: "no-store",
            },
        }),
    });
});
import {Module} from '@nestjs/common';
import {GraphQLModule} from '@nestjs/graphql';
import {ApolloDriver, type ApolloDriverConfig} from '@nestjs/apollo';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {AirportsModule} from './airports/airports.module.js';
import {DatabaseModule} from './database/database.module.js';
import {RoutesModule} from "./routes/routes.module.js";

const currentDir = dirname(fileURLToPath(import.meta.url));

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            path: '/graphql',
            typePaths: [join(currentDir, '**/*.graphql')],
            graphiql: true,
            introspection: true,
        }),
        DatabaseModule,
        AirportsModule,
        RoutesModule
    ],
})
export class AppModule {
}

import {Module} from '@nestjs/common';
import {RoutesResolver} from './routes.resolver.js';
import {RoutesService} from './routes.service.js';

@Module({
    providers: [RoutesResolver, RoutesService],
})
export class RoutesModule {
}

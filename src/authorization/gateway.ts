import { AuthorizationService } from './service';

import { AuthenticationService } from '../authentication/service';
import { Gateway } from '../core/gateway';
import { Proxy } from '../types';
import { AuthorizationContext, AuthorizationEvent } from './machine';

export class AuthorizationGateway extends Gateway<AuthorizationService> {
    private authenticationService: AuthenticationService;

    constructor(
        proxy: Proxy,
        lazyService: () => AuthorizationService,
        authenticationService: AuthenticationService,
    ) {
        super(proxy, lazyService);

        this.authenticationService = authenticationService;
    }

    private get challenges() {
        return this.authenticationService.state.context.challenges;
    }

    public async provision(context: AuthorizationContext, event: AuthorizationEvent) {
        try {
            const { permissions, user } = await this.proxy.provision(event.query, this.challenges);

            context.permissions = permissions;
            context.user = user;

            this.service.authorize(event.query);
        } catch (error) {
            this.service.deauthenticate({ error });
        }
    }

    public async authorize(context: AuthorizationContext, event: AuthorizationEvent) {
        try {
            await this.proxy.authorize(event.query, context.permissions, this.challenges);
            this.service.grant();
        } catch (error) {
            this.service.deny({ error });
        }
    }
}

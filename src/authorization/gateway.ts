import { AuthorizationService } from './service';

import { AuthenticationService } from '../authentication/service';
import { Gateway } from '../core/gateway';
import { Guard, Proxy } from '../types';
import { AuthorizationContext, AuthorizationEvent } from './machine';

export class AuthorizationGateway extends Gateway<AuthorizationService> {
    private authenticationService: AuthenticationService;
    private guard: Guard;

    constructor(
        proxy: Proxy,
        guard: Guard,
        deferredAuthorizationService: () => AuthorizationService,
        authenticationService: AuthenticationService,
    ) {
        super(proxy, deferredAuthorizationService);

        this.authenticationService = authenticationService;
        this.guard = guard;
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
        const { user, permissions } = context;
        try {
            if (await this.guard(event.query, user, permissions, this.challenges)) {
                this.service.grant();
            } else {
                this.service.deny();
            }
        } catch (error) {
            this.service.deny({ error });
        }
    }
}

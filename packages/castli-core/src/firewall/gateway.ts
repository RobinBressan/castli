import { AuthorizationService } from './service';

import { Gateway } from '../core/gateway';
import { Guard, Proxy } from '../core/types';
import { Fortress } from '../fortress';
import { AuthorizationContext, AuthorizationEvent } from './machine';

export class AuthorizationGateway extends Gateway<AuthorizationService> {
    private fortress: Fortress;
    private guard: Guard;

    constructor(
        proxy: Proxy,
        guard: Guard,
        deferredAuthorizationService: () => AuthorizationService,
        fortress: Fortress,
    ) {
        super(proxy, deferredAuthorizationService);

        this.fortress = fortress;
        this.guard = guard;
    }

    private get challenges() {
        return this.fortress.state.context.challenges;
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

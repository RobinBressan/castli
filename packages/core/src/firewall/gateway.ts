import { FirewallService } from './service';

import { Gateway } from '../core/gateway';
import { Guard, Proxy } from '../core/types';
import { Fortress } from '../fortress';
import { FirewallContext, FirewallEvent } from './machine';

export class FirewallGateway extends Gateway<FirewallService> {
    private fortress: Fortress;
    private guard: Guard;

    constructor(
        proxy: Proxy,
        guard: Guard,
        deferredService: () => FirewallService,
        fortress: Fortress,
    ) {
        super(proxy, deferredService);

        this.fortress = fortress;
        this.guard = guard;
    }

    private get challenges() {
        return this.fortress.state.context.challenges;
    }

    public async provision(context: FirewallContext, event: FirewallEvent) {
        try {
            const { permissions, user } = await this.proxy.provision(event.query, this.challenges);

            context.permissions = permissions;
            context.user = user;

            this.service.authorize(event.query);
        } catch (error) {
            this.service.deauthenticate({ error });
        }
    }

    public async authorize(context: FirewallContext, event: FirewallEvent) {
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

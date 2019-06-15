import { FirewallService } from './service';

import { Gateway } from '../core/gateway';
import { Fortress } from '../fortress';
import { FirewallEvent } from './machine';
import { Guard } from './types';

export class FirewallGateway<FortressContext, FirewallContext> extends Gateway<
    FirewallService<FortressContext, FirewallContext>
> {
    private fortress: Fortress<FortressContext, FirewallContext>;
    private guard: Guard<FortressContext, FirewallContext>;

    constructor(
        guard: Guard<FortressContext, FirewallContext>,
        deferredService: () => FirewallService<FortressContext, FirewallContext>,
        fortress: Fortress<FortressContext, FirewallContext>,
    ) {
        super(deferredService);

        this.fortress = fortress;
        this.guard = guard;
    }

    public async authorize(event: FirewallEvent) {
        try {
            const query = await this.guard(event.query, this.fortress.state
                .context as FortressContext);

            this.service.grant(query);
        } catch (error) {
            this.service.deny({ error });
        }
    }
}

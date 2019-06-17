import { SchedulerLike } from 'rxjs';
import { ObservableService } from '../core/observable-service';
import { Fortress } from '../fortress';
import { createMachine, FirewallEvent, FirewallStateSchema } from './machine';
import { Guard } from './types';

export class FirewallService<FortressContext, FirewallContext> extends ObservableService<
    FirewallContext,
    FirewallEvent,
    FirewallStateSchema
> {
    private fortress: Fortress<FortressContext, FirewallContext>;
    private guard: Guard<FortressContext, FirewallContext>;

    constructor(
        guard: Guard<FortressContext, FirewallContext>,
        fortress: Fortress<FortressContext, FirewallContext>,
        scheduler?: SchedulerLike,
    ) {
        super(createMachine(() => this), scheduler);
        this.fortress = fortress;
        this.guard = guard;
    }

    public async authorize(event: FirewallEvent) {
        try {
            const query = await this.guard(event.query, this.fortress.state
                .context as FortressContext);

            this.sendEvent({ type: 'GRANT', query });
        } catch (error) {
            this.sendEvent({ type: 'DENY', query: { error } });
        }
    }
}

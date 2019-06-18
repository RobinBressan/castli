import { SchedulerLike } from 'rxjs';
import { Facade } from '../core/facade';
import { Firewall, Guard } from '../firewall';
import { FortressService } from './service';
import { Strategy } from './strategy';

/**
 * A Fortress is the authentication layer of Castli.
 * It handles the workflow needed to retrieve challenges which will be used later on to perform authorization requests
 */
export class Fortress<
    FortressContext extends Record<string, any> = Record<string, any>,
    FirewallContext extends Record<string, any> = Record<string, any>
> extends Facade<FortressService<FortressContext>> {
    private guard: Guard<FortressContext, FirewallContext>;

    constructor(
        strategy: Strategy<any, FortressContext>,
        guard: Guard<FortressContext, FirewallContext>,
        scheduler?: SchedulerLike,
    ) {
        super(new FortressService<FortressContext>(strategy, scheduler));

        this.guard = guard;
    }

    get scheduler() {
        return this.service.scheduler;
    }

    get strategy() {
        return this.service.strategy;
    }

    public createFirewall(query: Record<string, any> = null) {
        return new Firewall<FortressContext, FirewallContext>(this.guard, query, this);
    }

    public challenge(query?: Record<string, any>) {
        this.service.sendEvent({ type: 'CHALLENGE', query });
    }

    public deauthenticate(query?: Record<string, any>) {
        this.service.sendEvent({ type: 'DEAUTHENTICATE', query });
    }
}

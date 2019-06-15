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
    public readonly challenge: FortressService<FortressContext>['challenge'];
    public readonly deauthenticate: FortressService<FortressContext>['deauthenticate'];

    private guard: Guard<FortressContext, FirewallContext>;

    constructor(
        strategy: Strategy<unknown, FortressContext>,
        guard: Guard<FortressContext, FirewallContext>,
        scheduler?: SchedulerLike,
    ) {
        super(new FortressService<FortressContext>(strategy, scheduler));

        this.guard = guard;

        this.challenge = this.service.challenge.bind(this.service);
        this.deauthenticate = this.service.deauthenticate.bind(this.service);
    }

    public createFirewall(query: Record<string, unknown> = null, scheduler?: SchedulerLike) {
        return new Firewall<FortressContext, FirewallContext>(this.guard, query, this, scheduler);
    }
}

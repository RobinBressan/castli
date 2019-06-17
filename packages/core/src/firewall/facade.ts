import { SchedulerLike, Subscription } from 'rxjs';
import { State } from 'xstate';

import { Facade } from '../core/facade';
import { Fortress, FortressEvent, FortressStateValue } from '../fortress';
import { FirewallService } from './service';
import { Guard } from './types';

export class Firewall<FortressContext, FirewallContext> extends Facade<
    FirewallService<FortressContext, FirewallContext>
> {
    public readonly query: Record<string, any>;

    private fortress: Fortress<FortressContext, FirewallContext>;
    private fortressSubscription: Subscription;

    constructor(
        guard: Guard<FortressContext, FirewallContext>,
        query: Record<string, any>,
        fortress: Fortress<FortressContext, FirewallContext>,
        scheduler?: SchedulerLike,
    ) {
        super(new FirewallService(guard, fortress, scheduler));

        this.fortress = fortress;
        this.query = query;
        this.fortressSubscription = this.fortress.subscribe(this.onFortressStateChange);
    }

    public dispose() {
        this.fortressSubscription.unsubscribe();
    }

    private onFortressStateChange = (
        value: [State<FortressContext, FortressEvent>, FortressEvent],
    ) => {
        const [state] = value;

        switch (state.value as FortressStateValue) {
            case 'authenticated':
                this.service.sendEvent({ type: 'AUTHORIZE', query: this.query });
                break;
            case 'unauthenticated':
                this.service.sendEvent('DEAUTHENTICATE');
                break;
            case 'idle':
                break;
            default:
                this.service.sendEvent('RESET');
        }
    };
}

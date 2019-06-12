import { Subscription } from 'rxjs';

import { Facade } from '../core/facade';
import { Guard, Proxy } from '../core/types';
import { Fortress, FortressStateValue } from '../fortress';
import { FirewallService } from './service';

export class Firewall extends Facade<FirewallService> {
    public readonly query: Record<string, any>;

    private fortress: Fortress;
    private fortressSubscription: Subscription;

    constructor(proxy: Proxy, guard: Guard, query: Record<string, any>, fortress: Fortress) {
        super(new FirewallService(proxy, guard, fortress));

        this.fortress = fortress;
        this.query = query;
        this.fortressSubscription = this.fortress.subscribe(this.onFortressStateChange);
    }

    public dispose() {
        this.fortressSubscription.unsubscribe();
    }

    private onFortressStateChange = value => {
        const [state] = value;

        switch (state.value as FortressStateValue) {
            case 'authenticated':
                this.service.provision(this.query);
                break;
            case 'unauthenticated':
                this.service.deauthenticate();
                break;
            case 'idle':
                break;
            default:
                this.service.reset();
        }
    };
}

import { Subscription } from 'rxjs';

import { Facade } from '../core/facade';
import { Guard, Proxy } from '../core/types';
import { AuthenticationStateValues, Fortress } from '../fortress';
import { AuthorizationService } from './service';

export class Firewall extends Facade<AuthorizationService> {
    public readonly query: Record<string, any>;

    private fortress: Fortress;
    private fortressSubscription: Subscription;

    constructor(proxy: Proxy, guard: Guard, query: Record<string, any>, fortress: Fortress) {
        super(new AuthorizationService(proxy, guard, fortress));

        this.fortress = fortress;
        this.query = query;
        this.fortressSubscription = this.fortress.subscribe(this.onAuthenticationStateChange);
    }

    public dispose() {
        this.fortressSubscription.unsubscribe();
    }

    private onAuthenticationStateChange = value => {
        const [state] = value;

        switch (state.value as AuthenticationStateValues) {
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

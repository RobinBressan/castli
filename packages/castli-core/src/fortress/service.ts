import { ObservableService } from '../core/observable-service';
import { Proxy } from '../core/types';
import { AuthenticationGateway } from './gateway';
import {
    AuthenticationContext,
    AuthenticationEvent,
    AuthenticationStateSchema,
    createMachine,
} from './machine';

export class AuthenticationService extends ObservableService<
    AuthenticationContext,
    AuthenticationStateSchema,
    AuthenticationEvent
> {
    constructor(proxy: Proxy) {
        super(createMachine(new AuthenticationGateway(proxy, () => this)));
    }

    public authenticate() {
        this.sendEvent('AUTHENTICATE');
    }

    public challenge(query?: Record<string, any>) {
        this.sendEvent({ type: 'CHALLENGE', query });
    }

    public deauthenticate(query?: Record<string, any>) {
        this.sendEvent({ type: 'DEAUTHENTICATE', query });
    }
}

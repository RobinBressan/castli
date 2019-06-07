import { ObservableService } from '../observable-service';
import { Proxy } from '../types';
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
        this.send('AUTHENTICATE');
    }

    public challenge(query?: Record<string, any>) {
        this.send({ type: 'CHALLENGE', query });
    }

    public deauthenticate(query?: Record<string, any>) {
        this.send({ type: 'DEAUTHENTICATE', query });
    }
}

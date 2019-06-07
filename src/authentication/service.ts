import { ObservableService } from '../observable-service';
import { Proxy } from '../types';
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
        super(createMachine(proxy));
    }

    public challenge(query?: Record<string, any>) {
        this.send({ type: 'AUTHENTICATE', query });
    }

    public deauthenticate() {
        this.send('DEAUTHENTICATE');
    }
}

import { AuthenticationService } from '../authentication/service';
import { ObservableService } from '../observable-service';
import { Proxy } from '../types';
import { AuthorizationGateway } from './gateway';
import {
    AuthorizationContext,
    AuthorizationEvent,
    AuthorizationStateSchema,
    createMachine,
} from './machine';

export class AuthorizationService extends ObservableService<
    AuthorizationContext,
    AuthorizationStateSchema,
    AuthorizationEvent
> {
    constructor(proxy: Proxy, authenticationService: AuthenticationService) {
        super(createMachine(new AuthorizationGateway(proxy, () => this, authenticationService)));
    }

    public authorize(query?: Record<string, any>) {
        this.send({ type: 'AUTHORIZE', query });
    }

    public deny(query?: Record<string, any>) {
        this.send({ type: 'DENY', query });
    }

    public deauthenticate(query?: Record<string, any>) {
        this.send({ type: 'DEAUTHENTICATE', query });
    }

    public grant() {
        this.send('GRANT');
    }

    public provision(query?: Record<string, any>) {
        this.send({ type: 'PROVISION', query });
    }

    public reset() {
        this.send('RESET');
    }
}

import { AuthenticationService } from '../authentication/service';
import { ObservableService } from '../core/observable-service';
import { Guard, Proxy } from '../types';
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
    constructor(proxy: Proxy, guard: Guard, authenticationService: AuthenticationService) {
        super(
            createMachine(
                new AuthorizationGateway(proxy, guard, () => this, authenticationService),
            ),
        );
    }

    public authorize(query?: Record<string, any>) {
        this.sendEvent({ type: 'AUTHORIZE', query });
    }

    public deny(query?: Record<string, any>) {
        this.sendEvent({ type: 'DENY', query });
    }

    public deauthenticate(query?: Record<string, any>) {
        this.sendEvent({ type: 'DEAUTHENTICATE', query });
    }

    public grant() {
        this.sendEvent('GRANT');
    }

    public provision(query?: Record<string, any>) {
        this.sendEvent({ type: 'PROVISION', query });
    }

    public reset() {
        this.sendEvent('RESET');
    }
}

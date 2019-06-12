import { ObservableService } from '../core/observable-service';
import { Guard, Proxy } from '../core/types';
import { Fortress } from '../fortress';
import { AuthorizationGateway } from './gateway';
import {
    AuthorizationContext,
    AuthorizationEvent,
    AuthorizationStateSchema,
    AuthorizationStateValue,
    createMachine,
} from './machine';

export class AuthorizationService extends ObservableService<
    AuthorizationContext,
    AuthorizationStateSchema,
    AuthorizationEvent,
    AuthorizationStateValue
> {
    constructor(proxy: Proxy, guard: Guard, fortress: Fortress) {
        super(createMachine(new AuthorizationGateway(proxy, guard, () => this, fortress)));
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
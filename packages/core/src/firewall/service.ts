import { SchedulerLike } from 'rxjs';
import { ObservableService } from '../core/observable-service';
import { Guard, Proxy } from '../core/types';
import { Fortress } from '../fortress';
import { FirewallGateway } from './gateway';
import { createMachine, FirewallContext, FirewallEvent, FirewallStateSchema } from './machine';

export class FirewallService extends ObservableService<
    FirewallContext,
    FirewallEvent,
    FirewallStateSchema
> {
    constructor(proxy: Proxy, guard: Guard, fortress: Fortress, scheduler?: SchedulerLike) {
        super(createMachine(new FirewallGateway(proxy, guard, () => this, fortress)), scheduler);
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

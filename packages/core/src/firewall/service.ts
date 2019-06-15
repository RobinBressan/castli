import { SchedulerLike } from 'rxjs';
import { ObservableService } from '../core/observable-service';
import { Fortress } from '../fortress';
import { FirewallGateway } from './gateway';
import { createMachine, FirewallEvent, FirewallStateSchema } from './machine';
import { Guard } from './types';

export class FirewallService<FortressContext, FirewallContext> extends ObservableService<
    FirewallContext,
    FirewallEvent,
    FirewallStateSchema
> {
    constructor(
        guard: Guard<FortressContext, FirewallContext>,
        fortress: Fortress<FortressContext, FirewallContext>,
        scheduler?: SchedulerLike,
    ) {
        super(createMachine(new FirewallGateway(guard, () => this, fortress)), scheduler);
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

    public grant(query?: Record<string, any>) {
        this.sendEvent({ type: 'GRANT', query });
    }

    public reset() {
        this.sendEvent('RESET');
    }
}

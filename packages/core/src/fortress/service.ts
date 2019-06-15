import { SchedulerLike } from 'rxjs';
import { ObservableService } from '../core/observable-service';
import { FortressGateway } from './gateway';
import { createMachine, FortressEvent, FortressStateSchema } from './machine';
import { Strategy } from './strategy';

export class FortressService<FortressContext> extends ObservableService<
    FortressContext,
    FortressEvent,
    FortressStateSchema
> {
    constructor(strategy: Strategy<any, FortressContext>, scheduler?: SchedulerLike) {
        super(createMachine(new FortressGateway<FortressContext>(strategy, () => this)), scheduler);
    }

    public authenticate(query?: Record<string, unknown>) {
        this.sendEvent({ type: 'AUTHENTICATE', query });
    }

    public challenge(query?: Record<string, unknown>) {
        this.sendEvent({ type: 'CHALLENGE', query });
    }

    public deauthenticate(query?: Record<string, unknown>) {
        this.sendEvent({ type: 'DEAUTHENTICATE', query });
    }
}

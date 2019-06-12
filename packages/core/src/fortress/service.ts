import { ObservableService } from '../core/observable-service';
import { Proxy } from '../core/types';
import { FortressGateway } from './gateway';
import { createMachine, FortressContext, FortressEvent, FortressStateSchema } from './machine';

export class FortressService extends ObservableService<
    FortressContext,
    FortressEvent,
    FortressStateSchema
> {
    constructor(proxy: Proxy) {
        super(createMachine(new FortressGateway(proxy, () => this)));
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

import { ObservableService } from '@castli/core';
import { SchedulerLike } from 'rxjs';

import { createMachine, SimpleAuthEvent, SimpleAuthStateSchema } from './machine';
import { Proxy } from './types';

export class SimpleAuthService<Query extends Record<string, any>> extends ObservableService<
    {},
    SimpleAuthEvent,
    SimpleAuthStateSchema
> {
    private proxy: Proxy;

    constructor(proxy: Proxy, scheduler?: SchedulerLike) {
        super(
            createMachine({ beginChallenge: (_, event) => this.challenge(event.query as Query) }),
            scheduler,
        );
        this.proxy = proxy;
    }

    public async challenge(query: Query) {
        try {
            const response = await this.proxy.request(query);
            this.sendEvent({ type: 'AUTHENTICATE', query: response });
        } catch (error) {
            this.sendEvent({ type: 'DEAUTHENTICATE', query: { error } });
        }
    }
}

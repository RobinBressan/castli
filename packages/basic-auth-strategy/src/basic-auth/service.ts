import { ObservableService } from '@castli/core';
import { SchedulerLike } from 'rxjs';

import { Proxy } from '../types';
import { BasicAuthEvent, BasicAuthStateSchema, createMachine } from './machine';

export class BasicAuthService<Query extends Record<string, any>> extends ObservableService<
    {},
    BasicAuthEvent,
    BasicAuthStateSchema
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

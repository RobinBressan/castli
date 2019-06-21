import { Strategy } from '@castli/core';
import { race, SchedulerLike } from 'rxjs';
import { observeOn } from 'rxjs/operators';

import { SimpleAuthService } from './service';
import { Proxy } from './types';

export class SimpleAuthStrategy<
    Query extends Record<string, any> = Record<string, any>,
    Response extends Record<string, any> = Record<string, any>
> extends Strategy<Query, Response> {
    constructor(proxy: Proxy<Query, Response>, scheduler?: SchedulerLike) {
        super(new SimpleAuthService(proxy, scheduler));
    }

    public async begin(
        query: Query,
        commit: (response: Response) => void,
        rollback: (response: Response) => void,
    ) {
        race(this.waitFor$('authenticated'), this.waitFor$('unauthenticated'))
            .pipe(observeOn(this.service.scheduler))
            .subscribe(value => {
                const [state, event] = value;
                switch (state.value) {
                    case 'authenticated':
                        commit(event.query as Response);
                        break;
                    case 'unauthenticated':
                        rollback(event.query);
                        break;
                }

                this.service.dispose();
            });

        this.service.sendEvent({ type: 'CHALLENGE', query });
    }
}

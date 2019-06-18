import { Strategy } from '@castli/core';
import { race, SchedulerLike } from 'rxjs';
import { observeOn } from 'rxjs/operators';

import { BasicAuth } from './facade';
import { BasicAuthService } from './service';
import { Proxy } from './types';

export class BasicAuthStrategy<
    Query extends Record<string, any> = Record<string, any>,
    Response extends Record<string, any> = Record<string, any>
> extends Strategy<Query, Response> {
    constructor(proxy: Proxy<Query, Response>) {
        super(
            (scheduler: SchedulerLike) => new BasicAuthService<Query>(proxy, scheduler),
            (service: BasicAuthService<Query>) => new BasicAuth<Query>(service),
        );
    }

    public async begin(query?: Query) {
        this.service.restart();

        race(this.service.waitFor$('authenticated'), this.service.waitFor$('unauthenticated'))
            .pipe(observeOn(this.service.scheduler))
            .subscribe(value => {
                const [state, event] = value;
                switch (state.value) {
                    case 'authenticated':
                        this.commit(event.query as Response);
                        break;
                    case 'unauthenticated':
                        this.rollback(event.query);
                        break;
                }

                this.service.dispose();
            });

        this.service.sendEvent({ type: 'CHALLENGE', query });
    }
}

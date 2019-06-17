import { Proxy, Strategy } from '@castli/core';
import { race } from 'rxjs';
import { observeOn } from 'rxjs/operators';
import { BasicAuthService } from './service';

export class BasicAuthStrategy<
    Query extends Record<string, any> = Record<string, any>,
    Response extends Record<string, any> = Record<string, any>
> extends Strategy<Query, Response> {
    private proxy: Proxy<Query, Response>;

    constructor(proxy: Proxy<Query, Response>) {
        super();
        this.proxy = proxy;
    }

    public async begin(query?: Query) {
        const service = new BasicAuthService<Query>(this.proxy, this.scheduler);

        race(service.waitFor$('authenticated'), service.waitFor$('unauthenticated'))
            .pipe(observeOn(service.scheduler))
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

                service.dispose();
            });

        service.sendEvent({ type: 'CHALLENGE', query });
    }
}

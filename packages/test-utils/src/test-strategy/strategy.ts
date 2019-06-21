import { Strategy } from '@castli/core';
import { race, SchedulerLike } from 'rxjs';
import { observeOn } from 'rxjs/operators';

import { TestService } from './service';

export class TestStrategy extends Strategy {
    constructor(scheduler?: SchedulerLike) {
        super(new TestService(scheduler));
    }

    public async begin(
        _: Record<string, any>,
        commit: (response: Record<string, any>) => void,
        rollback: (response: Record<string, any>) => void,
    ) {
        race(this.waitFor$('committed'), this.waitFor$('rollbacked'))
            .pipe(observeOn(this.service.scheduler))
            .subscribe(value => {
                const [state, event] = value;
                switch (state.value) {
                    case 'committed':
                        commit(event.query);
                        break;
                    case 'rollbacked':
                        rollback(event.query);
                        break;
                }

                this.service.dispose();
            });
    }

    public commit(query?: Record<string, any>) {
        this.service.sendEvent({ type: 'COMMIT', query });
    }

    public rollback(query?: Record<string, any>) {
        this.service.sendEvent({ type: 'ROLLBACK', query });
    }
}

import { SchedulerLike } from 'rxjs';
import { ObservableService } from '../core/observable-service';
import { createMachine, FortressEvent, FortressStateSchema } from './machine';
import { Strategy } from './strategy';

export class FortressService<FortressContext> extends ObservableService<
    FortressContext,
    FortressEvent,
    FortressStateSchema
> {
    public readonly strategy: Strategy<any, FortressContext>;

    constructor(strategy: Strategy<any, FortressContext>, scheduler?: SchedulerLike) {
        super(
            createMachine({
                beginChallenge: (_, event) =>
                    this.strategy.begin(event.query, this.commit, this.rollback),
            }),
            scheduler,
        );

        this.strategy = strategy;
    }

    private commit = (query: any) => {
        this.sendEvent({ type: 'AUTHENTICATE', query });
    };

    private rollback = (query: Record<string, any>) => {
        this.sendEvent({ type: 'DEAUTHENTICATE', query });
    };
}

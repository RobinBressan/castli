import { SchedulerLike } from 'rxjs';
import { ObservableService } from '../core/observable-service';
import { createMachine, FortressEvent, FortressStateSchema } from './machine';
import { Strategy } from './strategy';

export class FortressService<FortressContext> extends ObservableService<
    FortressContext,
    FortressEvent,
    FortressStateSchema
> {
    private strategy: Strategy<any, FortressContext>;

    constructor(strategy: Strategy<any, FortressContext>, scheduler?: SchedulerLike) {
        super(createMachine(() => this), scheduler);

        this.strategy = strategy.injectFortressService(this);
    }

    public beginStrategy(query?: Record<string, unknown>) {
        return this.strategy.begin(query);
    }
}

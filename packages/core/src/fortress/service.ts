import { SchedulerLike } from 'rxjs';
import { ObservableService } from '../core/observable-service';
import { createMachine, FortressEvent, FortressStateSchema } from './machine';
import { Strategy } from './strategy';

export class FortressService<FortressContext> extends ObservableService<
    FortressContext,
    FortressEvent,
    FortressStateSchema
> {
    // tslint:disable-next-line:variable-name
    private _strategy: Strategy<any, FortressContext>;

    constructor(strategy: Strategy<any, FortressContext>, scheduler?: SchedulerLike) {
        super(createMachine(() => this), scheduler);

        this._strategy = strategy.boot(this);
    }

    get strategy() {
        return this._strategy.facade;
    }

    public beginStrategy(query?: Record<string, unknown>) {
        return this._strategy.begin(query);
    }
}

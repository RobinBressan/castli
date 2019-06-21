import { ObservableService } from '@castli/core';
import { SchedulerLike } from 'rxjs';

import { createMachine, TestEvent, TestStateSchema } from './machine';

export class TestService extends ObservableService<{}, TestEvent, TestStateSchema> {
    constructor(scheduler?: SchedulerLike) {
        super(createMachine(), scheduler);
    }
}

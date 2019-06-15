import { FortressEvent } from './machine';
import { FortressService } from './service';

import { Gateway } from '../core/gateway';
import { Strategy } from './strategy';

export class FortressGateway<FortressContext> extends Gateway<FortressService<FortressContext>> {
    private strategy: Strategy;
    private injected = false;

    constructor(
        strategy: Strategy<any, FortressContext>,
        deferredService: () => FortressService<FortressContext>,
    ) {
        super(deferredService);
        this.strategy = strategy;
    }

    public async challenge(_, event: FortressEvent) {
        this.inject();
        this.strategy.start(event.query);
    }

    private inject() {
        if (this.injected) {
            return;
        }

        this.strategy.injectFortressService(this.service);
        this.injected = true;
    }
}

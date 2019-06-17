import { Strategy } from '@castli/core';

export class TestStrategy extends Strategy {
    private shouldResolve: boolean;

    constructor(shouldResolve = true) {
        super();
        this.shouldResolve = shouldResolve;
    }

    public begin(query?: Record<string, any>) {
        if (this.shouldResolve) {
            process.nextTick(() => this.commit(query));
        } else {
            process.nextTick(() => this.rollback(new Error('Failure')));
        }
    }
}

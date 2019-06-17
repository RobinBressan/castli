import { Strategy } from '@castli/core';

export class TestStrategy extends Strategy {
    private shouldResolve: boolean;

    constructor(shouldResolve = true) {
        super(
            () =>
                ({
                    pipe: jest.fn(),
                    subscribe: jest.fn(),
                    waitFor$: jest.fn(),
                } as any),
        );
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

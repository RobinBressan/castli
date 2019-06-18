import { Strategy } from '@castli/core';

export class TestStrategy extends Strategy {
    private shouldResolve: boolean;

    constructor(shouldResolve = true) {
        const fakeService = {
            pipe: jest.fn(),
            subscribe: jest.fn(),
            waitFor$: jest.fn(),
        } as any;

        super(fakeService);
        this.shouldResolve = shouldResolve;
    }

    public begin(query: Record<string, any>, commit, rollback) {
        if (this.shouldResolve) {
            process.nextTick(() => commit(query));
        } else {
            process.nextTick(() => rollback(new Error('Failure')));
        }
    }
}

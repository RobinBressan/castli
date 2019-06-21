import { Event } from '@castli/core';
import { Machine, State as BaseState } from 'xstate';

export type TestEvent = Event<'COMMIT'> | Event<'ROLLBACK'>;

export type TestStateValue = 'committed' | 'idle' | 'rollbacked';

export interface TestStateSchema {
    states: Record<TestStateValue, {}>;
}

export type State = BaseState<{}, TestEvent>;

export function createMachine() {
    return Machine<{}, TestStateSchema, TestEvent>({
        id: 'test',
        initial: 'idle',
        states: {
            committed: {},
            idle: {
                on: {
                    COMMIT: 'committed',
                    ROLLBACK: 'rollbacked',
                },
            },
            rollbacked: {},
        },
    });
}

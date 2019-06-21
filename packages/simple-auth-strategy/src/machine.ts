import { Event } from '@castli/core';
import { ActionFunction, ActionObject, Machine, State as BaseState } from 'xstate';

export type SimpleAuthEvent =
    | Event<'AUTHENTICATE'>
    | Event<'CHALLENGE'>
    | Event<'DEAUTHENTICATE'>
    | Event<'RECHALLENGE'>;

export type SimpleAuthStateValue = 'authenticated' | 'challenging' | 'idle' | 'unauthenticated';

export interface SimpleAuthStateSchema {
    states: Record<SimpleAuthStateValue, {}>;
}

export type State = BaseState<{}, SimpleAuthEvent>;

interface Actions
    extends Record<
        string,
        ActionObject<{}, SimpleAuthEvent> | ActionFunction<{}, SimpleAuthEvent>
    > {
    beginChallenge(context: {}, event: SimpleAuthEvent);
}

export function createMachine(actions: Actions) {
    return Machine<{}, SimpleAuthStateSchema, SimpleAuthEvent>(
        {
            id: 'simple-auth',
            initial: 'idle',
            states: {
                authenticated: {},
                challenging: {
                    entry: ['beginChallenge'],
                    on: {
                        AUTHENTICATE: 'authenticated',
                        DEAUTHENTICATE: 'unauthenticated',
                    },
                },
                idle: {
                    on: {
                        CHALLENGE: 'challenging',
                    },
                },
                unauthenticated: {},
            },
        },
        {
            actions,
        },
    );
}

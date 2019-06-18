import { Event } from '@castli/core';
import { ActionFunction, ActionObject, Machine, State as BaseState } from 'xstate';

export type BasicAuthEvent =
    | Event<'AUTHENTICATE'>
    | Event<'CHALLENGE'>
    | Event<'DEAUTHENTICATE'>
    | Event<'RECHALLENGE'>;

export type BasicAuthStateValue = 'authenticated' | 'challenging' | 'idle' | 'unauthenticated';

export interface BasicAuthStateSchema {
    states: Record<BasicAuthStateValue, {}>;
}

export type State = BaseState<{}, BasicAuthEvent>;

interface Actions
    extends Record<string, ActionObject<{}, BasicAuthEvent> | ActionFunction<{}, BasicAuthEvent>> {
    beginChallenge(context: {}, event: BasicAuthEvent);
}

export function createMachine(actions: Actions) {
    return Machine<{}, BasicAuthStateSchema, BasicAuthEvent>(
        {
            id: 'basic-auth',
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

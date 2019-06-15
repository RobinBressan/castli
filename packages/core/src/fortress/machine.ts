import { assign, Machine, State as BaseState } from 'xstate';

import { Event } from '../core/types';
import { FortressGateway } from './gateway';

export type FortressEvent =
    | Event<'AUTHENTICATE'>
    | Event<'CHALLENGE'>
    | Event<'DEAUTHENTICATE'>
    | Event<'RECHALLENGE'>;

export type FortressStateValue = 'authenticated' | 'challenging' | 'idle' | 'unauthenticated';

export interface FortressStateSchema {
    states: Record<FortressStateValue, {}>;
}

export type State<FortressContext> = BaseState<FortressContext, FortressEvent>;

export function createMachine<FortressContext extends Record<string, any> = Record<string, any>>(
    gateway: FortressGateway<FortressContext>,
) {
    return Machine<FortressContext, FortressStateSchema, FortressEvent>(
        {
            id: 'fortress',
            initial: 'idle',
            states: {
                authenticated: {
                    entry: ['flushQueryToContext'],
                    on: {
                        DEAUTHENTICATE: 'unauthenticated',
                    },
                },
                challenging: {
                    entry: ['beginChallenge'],
                    on: {
                        AUTHENTICATE: 'authenticated',
                        DEAUTHENTICATE: 'unauthenticated',
                        RECHALLENGE: 'idle',
                    },
                },
                idle: {
                    on: {
                        CHALLENGE: 'challenging',
                        DEAUTHENTICATE: 'unauthenticated',
                    },
                },
                unauthenticated: {
                    on: {
                        CHALLENGE: 'challenging',
                    },
                },
            },
        },
        {
            actions: {
                async beginChallenge(context, event) {
                    gateway.challenge(context, event);
                },
                flushQueryToContext: assign((_, event) => {
                    return event.query as FortressContext;
                }),
            },
        },
        {} as FortressContext,
    );
}

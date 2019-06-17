import { assign, Machine, State as BaseState } from 'xstate';

import { Event } from '../core/types';
import { FortressService } from './service';

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
    deferredService: () => FortressService<FortressContext>,
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
                async beginChallenge(_, event) {
                    deferredService().beginStrategy(event.query);
                },
                flushQueryToContext: assign((_, event) => {
                    return event.query as FortressContext;
                }),
            },
        },
        {} as FortressContext,
    );
}

import { Machine, State as BaseState } from 'xstate';

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

export interface FortressContext {
    challenges: Array<Record<string, any>>;
}

export type State = BaseState<FortressContext, FortressEvent>;

export function createMachine(gateway: FortressGateway) {
    return Machine<FortressContext, FortressStateSchema, FortressEvent>(
        {
            id: 'authentication',
            initial: 'idle',
            states: {
                authenticated: {
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
            },
        },
        { challenges: [] },
    );
}

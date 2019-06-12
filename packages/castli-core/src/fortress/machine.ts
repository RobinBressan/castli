import { Machine, State as BaseState } from 'xstate';

import { Event } from '../core/types';
import { AuthenticationGateway } from './gateway';

export type AuthenticationEvent =
    | Event<'AUTHENTICATE'>
    | Event<'CHALLENGE'>
    | Event<'DEAUTHENTICATE'>
    | Event<'RECHALLENGE'>;
export type AuthenticationStateValue = 'authenticated' | 'challenging' | 'idle' | 'unauthenticated';
export interface AuthenticationStateSchema {
    states: Record<AuthenticationStateValue, {}>;
}

export interface AuthenticationContext {
    challenges: Array<Record<string, any>>;
}

export type State = BaseState<AuthenticationContext, AuthenticationEvent>;

export function createMachine(gateway: AuthenticationGateway) {
    return Machine<AuthenticationContext, AuthenticationStateSchema, AuthenticationEvent>(
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

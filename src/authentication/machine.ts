import { Machine, State as BaseState } from 'xstate';

import { Event } from '../types';
import { AuthenticationGateway } from './gateway';

export type AuthenticationEvent =
    | Event<'AUTHENTICATE'>
    | Event<'CHALLENGE'>
    | Event<'DEAUTHENTICATE'>;
export type AuthenticationStates = 'authenticated' | 'challenging' | 'idle' | 'unauthenticated';
export interface AuthenticationStateSchema {
    states: {
        idle: {};
        unauthenticated: {};
        challenging: {};
        authenticated: {};
    };
}

export interface AuthenticationContext {
    challenge: Record<string, any>;
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
        { challenge: null },
    );
}

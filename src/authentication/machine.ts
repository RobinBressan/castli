import { Machine, send, State as BaseState } from 'xstate';

import { Event, Proxy } from '../types';

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

export function createMachine(proxy: Proxy) {
    return Machine<AuthenticationContext, AuthenticationStateSchema, AuthenticationEvent>(
        {
            id: 'auth',
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
                        AUTHENTICATE: 'challenging',
                    },
                },
            },
        },
        {
            actions: {
                async beginChallenge(context, event) {
                    const response = await proxy.challenge(event.query);
                    context.challenge = response;

                    send('AUTHENTICATE');
                },
            },
        },
    );
}

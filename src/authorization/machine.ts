import { Machine, send, State as BaseState } from 'xstate';

import { Challenge, Event, Permission, Proxy, User } from '../types';

export type AuthorizationEvent =
    | Event<'RESET'>
    | Event<'AUTHORIZE'>
    | Event<'DENY'>
    | Event<'GRANT'>
    | Event<'PROVISION'>
    | Event<'DEAUTHENTICATE'>;
export type AuthorizationStates =
    | 'authorizing'
    | 'denied'
    | 'granted'
    | 'idle'
    | 'provisioning'
    | 'unauthenticated';
export interface AuthorizationStateSchema {
    states: {
        authorizing: {};
        denied: {};
        granted: {};
        idle: {};
        provisioning: {};
        unauthenticated: {};
    };
}

export interface AuthorizationContext {
    permissions: Permission[];
    user: User;
}

export type State = BaseState<AuthorizationContext, AuthorizationEvent>;

export function createMachine(proxy: Proxy, resolveChallenge: () => Challenge) {
    return Machine<AuthorizationContext, AuthorizationStateSchema, AuthorizationEvent>(
        {
            id: 'authorization',
            initial: 'idle',
            states: {
                authorizing: {
                    entry: ['beginAuthorizing'],
                    on: {
                        DENY: 'denied',
                        GRANT: 'granted',
                        RESET: 'idle',
                    },
                },
                denied: {
                    on: {
                        PROVISION: 'provisioning',
                        RESET: 'idle',
                    },
                },
                granted: {
                    on: {
                        PROVISION: 'provisioning',
                        RESET: 'idle',
                    },
                },
                idle: {
                    on: {
                        DEAUTHENTICATE: 'unauthenticated',
                        PROVISION: 'provisioning',
                    },
                },
                provisioning: {
                    entry: ['beginProvisioning'],
                    on: {
                        AUTHORIZE: 'authorizing',
                        RESET: 'idle',
                    },
                },
                unauthenticated: {
                    on: {
                        RESET: 'idle',
                    },
                },
            },
        },
        {
            actions: {
                async beginProvisioning(context, event) {
                    const { permissions, user } = await proxy.provision(
                        event.query,
                        resolveChallenge(),
                    );

                    context.permissions = permissions;
                    context.user = user;

                    send('AUTHORIZE');
                },
                async beginAuthorizing(context, event) {
                    try {
                        await proxy.authorize(event.query, context.permissions, resolveChallenge());
                        send('GRANT');
                    } catch (error) {
                        send({ type: 'DENY', query: { error } });
                    }
                },
            },
        },
        { permissions: null, user: null },
    );
}

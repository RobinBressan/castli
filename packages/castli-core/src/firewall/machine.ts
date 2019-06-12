import { Machine, State as BaseState } from 'xstate';

import { Event, Permission, User } from '../core/types';
import { AuthorizationGateway } from './gateway';

export type AuthorizationEvent =
    | Event<'RESET'>
    | Event<'AUTHORIZE'>
    | Event<'DENY'>
    | Event<'GRANT'>
    | Event<'PROVISION'>
    | Event<'DEAUTHENTICATE'>;

export type AuthorizationStateValue =
    | 'authorizing'
    | 'denied'
    | 'granted'
    | 'idle'
    | 'provisioning'
    | 'unauthenticated';

export interface AuthorizationStateSchema {
    states: Record<AuthorizationStateValue, {}>;
}

export interface AuthorizationContext {
    permissions: Permission[];
    user: User;
}

export type State = BaseState<AuthorizationContext, AuthorizationEvent>;

export function createMachine(gateway: AuthorizationGateway) {
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
                    gateway.provision(context, event);
                },
                async beginAuthorizing(context, event) {
                    gateway.authorize(context, event);
                },
            },
        },
        { permissions: null, user: null },
    );
}

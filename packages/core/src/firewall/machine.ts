import { Machine, State as BaseState } from 'xstate';

import { Event, Permission, User } from '../core/types';
import { FirewallGateway } from './gateway';

export type FirewallEvent =
    | Event<'RESET'>
    | Event<'AUTHORIZE'>
    | Event<'DENY'>
    | Event<'GRANT'>
    | Event<'PROVISION'>
    | Event<'DEAUTHENTICATE'>;

export type FirewallStateValue =
    | 'authorizing'
    | 'denied'
    | 'granted'
    | 'idle'
    | 'provisioning'
    | 'unauthenticated';

export interface FirewallStateSchema {
    states: Record<FirewallStateValue, {}>;
}

export interface FirewallContext {
    permissions: Permission[];
    user: User;
}

export type State = BaseState<FirewallContext, FirewallEvent>;

export function createMachine(gateway: FirewallGateway) {
    return Machine<FirewallContext, FirewallStateSchema, FirewallEvent>(
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
                    await gateway.provision(context, event);
                },
                async beginAuthorizing(context, event) {
                    await gateway.authorize(context, event);
                },
            },
        },
        { permissions: null, user: null },
    );
}

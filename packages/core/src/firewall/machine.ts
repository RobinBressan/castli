import { assign, Machine, State as BaseState } from 'xstate';

import { Event } from '../core/types';
import { FirewallService } from './service';

export type FirewallEvent =
    | Event<'RESET'>
    | Event<'AUTHORIZE'>
    | Event<'DENY'>
    | Event<'GRANT'>
    | Event<'DEAUTHENTICATE'>;

export type FirewallStateValue = 'authorizing' | 'denied' | 'granted' | 'idle' | 'unauthenticated';

export interface FirewallStateSchema {
    states: Record<FirewallStateValue, {}>;
}

export type State<FirewallContext> = BaseState<FirewallContext, FirewallEvent>;

export function createMachine<
    FortressContext extends Record<string, any> = Record<string, any>,
    FirewallContext extends Record<string, any> = Record<string, any>
>(deferredService: () => FirewallService<FortressContext, FirewallContext>) {
    return Machine<FirewallContext, FirewallStateSchema, FirewallEvent>(
        {
            id: 'firewall',
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
                    entry: ['flushQueryToContext'],
                    on: {
                        AUTHORIZE: 'authorizing',
                        RESET: 'idle',
                    },
                },
                granted: {
                    entry: ['flushQueryToContext'],
                    on: {
                        AUTHORIZE: 'authorizing',
                        RESET: 'idle',
                    },
                },
                idle: {
                    on: {
                        AUTHORIZE: 'authorizing',
                        DEAUTHENTICATE: 'unauthenticated',
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
                async beginAuthorizing(_, event) {
                    await deferredService().authorize(event);
                },
                flushQueryToContext: assign((_, event) => {
                    return event.query as FirewallContext;
                }),
            },
        },
        {} as FirewallContext,
    );
}

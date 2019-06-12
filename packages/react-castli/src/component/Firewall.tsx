import { AuthorizationContext, AuthorizationStateValues } from 'castli-core';

import { useFirewall } from '../hook/useFirewall';
import { createFactory, ProviderProps } from './factory';

const factory = createFactory<AuthorizationStateValues, AuthorizationContext>(
    {
        permissions: null,
        user: null,
    },
    'Firewall',
);

export interface OwnProps {
    query?: Record<string, any>;
}

const Provider = factory.createProvider<OwnProps>((props: OwnProps) =>
    useFirewall.bind(null, props.query),
);

const Authorizing = factory.createStateValueConsumer('authorizing');
const Denied = factory.createStateValueConsumer('denied');
const Granted = factory.createStateValueConsumer('granted');
const Idle = factory.createStateValueConsumer('idle');
const Provisioning = factory.createStateValueConsumer('provisioning');
const Unauthenticated = factory.createStateValueConsumer('unauthenticated');

export type FirewallProps = ProviderProps<AuthorizationStateValues, AuthorizationContext>;
export const Firewall = Object.assign(
    {
        Authorizing,
        Denied,
        Granted,
        Idle,
        Provisioning,
        Unauthenticated,
    },
    Provider,
);

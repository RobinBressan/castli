import { AuthenticationContext, AuthenticationStateValues } from 'castli-core';

import { useFortress } from '../hook/useFortress';
import { createFactory, ProviderProps } from './factory';

const factory = createFactory<AuthenticationStateValues, AuthenticationContext>(
    {
        challenges: [],
    },
    'Fortress',
);

const Provider = factory.createProvider(() => useFortress);

const Authenticated = factory.createStateValueConsumer('authenticated');
const Challenging = factory.createStateValueConsumer('challenging');
const Idle = factory.createStateValueConsumer('idle');
const Unauthenticated = factory.createStateValueConsumer('unauthenticated');

export type FortressProps = ProviderProps<AuthenticationStateValues, AuthenticationContext>;
export const Fortress = Object.assign(
    {
        Authenticated,
        Challenging,
        Idle,
        Unauthenticated,
    },
    Provider,
);

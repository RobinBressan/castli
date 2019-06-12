import * as React from 'react';

import { createFormatter } from './createFormatter';
import { createProvider, HookResolver } from './createProvider';
import { createStateValueConsumer } from './createStateValueConsumer';

export { ProviderProps } from './createProvider';
export { StateValueConsumerProps } from './createStateValueConsumer';

export function createFactory<StateValues, Context>(initialContext: Context, prefix: string) {
    const context = React.createContext<Context>(initialContext);
    const formatter = createFormatter<StateValues>(prefix);

    return {
        createStateValueConsumer(value: StateValues) {
            return createStateValueConsumer<Context>(context, formatter(value));
        },
        createProvider<OwnProps>(hookResolver: HookResolver<StateValues, Context, OwnProps>) {
            return createProvider(context, formatter, hookResolver);
        },
    };
}

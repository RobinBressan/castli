import {
    AuthenticationContext,
    AuthenticationStateValues,
    Fortress,
    Guard,
    Proxy,
} from 'castli-core';
import * as React from 'react';

import { context } from '../context';

export interface ProviderProps {
    children: React.ReactNode;
    guard: Guard;
    proxy: Proxy;
    onStateChange(value: AuthenticationStateValues, context: AuthenticationContext);
}

export const Provider: React.SFC<ProviderProps> = ({ children, guard, onStateChange, proxy }) => {
    const value = React.useMemo(() => ({ fortress: new Fortress(proxy, guard) }), [guard, proxy]);

    React.useEffect(() => {
        const subscription = value.fortress.subscribe(e => {
            const [state] = e;
            onStateChange(state.value as AuthenticationStateValues, state.context);
        });

        return () => subscription.unsubscribe();
    }, [value]);

    return <context.Provider value={value}>{children}</context.Provider>;
};

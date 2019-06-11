import { Fortress, Guard, Proxy } from 'castli-core';
import * as React from 'react';

import { context } from '../context';

export interface ProviderProps {
    children: React.ReactNode;
    guard: Guard;
    proxy: Proxy;
}

export const Provider: React.SFC<ProviderProps> = ({ children, guard, proxy }) => {
    const value = React.useMemo(() => ({ fortress: new Fortress(proxy, guard) }), [guard, proxy]);

    return <context.Provider value={value}>{children}</context.Provider>;
};

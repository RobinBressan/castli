import { FirewallStateValue } from '@castli/core';
import * as React from 'react';

export interface FirewallReactContext<
    FirewallContext extends Record<string, any> = Record<string, any>
> {
    context: FirewallContext;
    stateValue: FirewallStateValue;
}

export const context = React.createContext<FirewallReactContext>({
    context: { permissions: [], user: null },
    stateValue: 'idle',
});

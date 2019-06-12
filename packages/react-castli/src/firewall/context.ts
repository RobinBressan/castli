import { FirewallContext, FirewallStateValue } from 'castli-core';
import * as React from 'react';

export interface FirewallReactContext {
    context: FirewallContext;
    stateValue: FirewallStateValue;
}

export const context = React.createContext<FirewallReactContext>({
    context: { permissions: [], user: null },
    stateValue: 'idle',
});

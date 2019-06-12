import { Fortress, FortressContext, FortressStateValue } from 'castli-core';
import * as React from 'react';

export interface FortressReactContext {
    context: FortressContext;
    fortress: Fortress;
    stateValue: FortressStateValue;
}

export const context = React.createContext<FortressReactContext>({
    context: { challenges: [] },
    fortress: null,
    stateValue: 'idle',
});

import { Fortress, FortressStateValue } from '@castli/core';
import * as React from 'react';

export interface FortressReactContext<
    FortressContext extends Record<string, any> = Record<string, any>
> {
    context: FortressContext;
    fortress: Fortress;
    stateValue: FortressStateValue;
}

export const context = React.createContext<FortressReactContext>({
    context: {},
    fortress: null,
    stateValue: 'idle',
});

import { Fortress } from 'castli-core';
import * as React from 'react';

export interface CastlyContext {
    fortress: Fortress;
}

export const context = React.createContext<CastlyContext>({ fortress: null });

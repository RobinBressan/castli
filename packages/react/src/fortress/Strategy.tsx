import { Facade, ObservableService } from '@castli/core';
import * as React from 'react';

import { useStrategy } from './useStrategy';

interface RenderResult {
    context: Record<string, any>;
    strategy: Facade<ObservableService>;
}

type Renderer = (result: RenderResult) => React.ReactNode;

export interface StrategyProps {
    stateValue: string;
    children: Renderer | React.ReactNode;
}

export const Strategy: React.SFC<StrategyProps> = ({ children, stateValue }) => {
    const { context, stateValue: currentStateValue, strategy } = useStrategy();

    return stateValue === currentStateValue ? (
        <>
            {typeof children === 'function'
                ? (children as Renderer)({ context, strategy })
                : children}
        </>
    ) : null;
};

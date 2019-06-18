import * as React from 'react';

import { useStrategy } from './useStrategy';

type Renderer = (context: Record<string, any>) => React.ReactNode;

export interface StrategyProps {
    stateValue: string;
    children: Renderer | React.ReactNode;
}

export const Strategy: React.SFC<StrategyProps> = ({ children, stateValue }) => {
    const { context, stateValue: currentStateValue } = useStrategy();

    return stateValue === currentStateValue ? (
        <>{typeof children === 'function' ? (children as Renderer)(context) : children}</>
    ) : null;
};

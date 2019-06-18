import { Fortress as FortressFacade, FortressStateValue, Guard, Strategy } from '@castli/core';
import * as React from 'react';
import { animationFrameScheduler, SchedulerLike } from 'rxjs';

import { context } from './context';

interface RenderResult {
    context: Record<string, any>;
    fortress: FortressFacade;
}

type Renderer = (result: RenderResult) => React.ReactNode;

export interface FortressProps {
    children: Renderer | React.ReactNode;
    guard: Guard;
    scheduler?: SchedulerLike;
    strategy: Strategy;
    onReady?(fortress: FortressFacade): void;
}

export const Fortress: React.SFC<FortressProps> = ({
    children,
    guard,
    onReady,
    scheduler = animationFrameScheduler,
    strategy,
}) => {
    const fortress = React.useMemo(() => new FortressFacade(strategy, guard, scheduler), [
        guard,
        strategy,
    ]);
    const [fortressStateValue, setFortressStateValue] = React.useState<FortressStateValue>('idle');
    const [fortressContext, setFortressContext] = React.useState<Record<string, any>>({});

    React.useEffect(() => {
        const subscription = fortress.subscribe(e => {
            const [state] = e;
            setFortressStateValue(state.value as FortressStateValue);
            setFortressContext(state.context);
        });

        if (onReady) {
            onReady(fortress);
        }

        return () => subscription.unsubscribe();
    }, [fortress]);

    const value = React.useMemo(
        () => ({ fortress, stateValue: fortressStateValue, context: fortressContext }),
        [fortress, fortressStateValue, fortressContext],
    );

    return (
        <context.Provider value={value}>
            {typeof children === 'function'
                ? (children as Renderer)({ context: fortressContext, fortress })
                : children}
        </context.Provider>
    );
};

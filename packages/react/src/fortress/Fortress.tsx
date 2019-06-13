import {
    Fortress as FortressClass,
    FortressContext,
    FortressStateValue,
    Guard,
    Proxy,
} from '@castli/core';
import * as React from 'react';
import { animationFrameScheduler } from 'rxjs';

import { context } from './context';

export interface FortressProps {
    children: React.ReactNode;
    guard: Guard;
    proxy: Proxy;
    onReady?(fortress: FortressClass): void;
}

export const Fortress: React.SFC<FortressProps> = ({ children, guard, onReady, proxy }) => {
    const fortress = React.useMemo(() => new FortressClass(proxy, guard, animationFrameScheduler), [
        guard,
        proxy,
    ]);
    const [fortressStateValue, setFortressStateValue] = React.useState<FortressStateValue>('idle');
    const [fortressContext, setFortressContext] = React.useState<FortressContext>({
        challenges: [],
    });

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

    return <context.Provider value={value}>{children}</context.Provider>;
};

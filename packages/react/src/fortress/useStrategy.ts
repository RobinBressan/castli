import { useEffect, useState } from 'react';

import { useFortress } from '../fortress';

export function useStrategy() {
    const { fortress } = useFortress();

    const [stateValue, setStrategyStateValue] = useState<string>('idle');
    const [context, setStrategyContext] = useState<Record<string, any>>({});

    useEffect(() => {
        const subscription = fortress.strategy.subscribe(e => {
            const [state] = e;
            setStrategyStateValue(state.value as string);
            setStrategyContext(state.context);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fortress]);

    return { context, stateValue, strategy: fortress.strategy };
}

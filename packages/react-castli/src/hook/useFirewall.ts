import { AuthorizationContext, AuthorizationStateValues } from 'castli-core';
import { useEffect, useState } from 'react';
import { useFortress } from './useFortress';

export function useFirewall(query?: Record<string, any>) {
    const { fortress } = useFortress();
    const [value, setValue] = useState<AuthorizationStateValues>('idle');
    const [context, setContext] = useState<AuthorizationContext>({ permissions: null, user: null });

    useEffect(() => {
        const firewall = fortress.createFirewall(query);
        const subscription = firewall.subscribe(e => {
            const [state] = e;
            setValue(state.value as AuthorizationStateValues);
            setContext(state.context);
        });

        return () => subscription.unsubscribe();
    }, [fortress, query]);

    return { context, value };
}

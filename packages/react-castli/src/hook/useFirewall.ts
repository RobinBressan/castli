import { AuthorizationContext, AuthorizationStates } from 'castli-core';
import { useEffect, useState } from 'react';
import { useFortress } from './useFortress';

export function useFirewall(query?: Record<string, any>) {
    const fortress = useFortress();
    const firewall = fortress.createFirewall(query);
    const [value, setValue] = useState<AuthorizationStates>('idle');
    const [context, setContext] = useState<AuthorizationContext>({ permissions: null, user: null });

    useEffect(() => {
        const subscription = firewall.subscribe(e => {
            const [state] = e;
            setValue(state.value as AuthorizationStates);
            setContext(state.context);
        });

        return () => subscription.unsubscribe();
    }, [fortress, query]);

    return { context, value };
}

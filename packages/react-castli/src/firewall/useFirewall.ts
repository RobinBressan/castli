import { FirewallContext, FirewallStateValue } from 'castli-core';
import { useEffect, useState } from 'react';
import { useFortress } from '../fortress';

export function useFirewall(query?: Record<string, any>) {
    const { fortress } = useFortress();

    const [stateValue, setFirewallStateValue] = useState<FirewallStateValue>('idle');
    const [context, setFirewallContext] = useState<FirewallContext>({
        permissions: [],
        user: null,
    });

    useEffect(() => {
        const subscription = fortress.createFirewall(query).subscribe(e => {
            const [state] = e;
            setFirewallStateValue(state.value as FirewallStateValue);
            setFirewallContext(state.context);
        });

        return () => subscription.unsubscribe();
    }, [fortress, query]);

    return { context, stateValue };
}

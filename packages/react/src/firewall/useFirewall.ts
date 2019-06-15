import { FirewallStateValue } from '@castli/core';
import { useEffect, useState } from 'react';
import { animationFrameScheduler } from 'rxjs';

import { useFortress } from '../fortress';

export function useFirewall(query?: Record<string, any>) {
    const { fortress } = useFortress();

    const [stateValue, setFirewallStateValue] = useState<FirewallStateValue>('idle');
    const [context, setFirewallContext] = useState<Record<string, any>>({
        permissions: [],
        user: null,
    });

    useEffect(() => {
        const firewall = fortress.createFirewall(query, animationFrameScheduler);
        const subscription = firewall.subscribe(e => {
            const [state] = e;
            setFirewallStateValue(state.value as FirewallStateValue);
            setFirewallContext(state.context);
        });

        return () => {
            subscription.unsubscribe();
            firewall.dispose();
        };
    }, [fortress, query]);

    return { context, stateValue };
}

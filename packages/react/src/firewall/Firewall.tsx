import * as React from 'react';

import { context } from './context';
import { useFirewall } from './useFirewall';

export interface FirewallProps {
    children: React.ReactNode;
    query?: Record<string, any>;
}

export const Firewall: React.SFC<FirewallProps> = ({ children, query }) => {
    const { context: firewallContext, stateValue } = useFirewall(query);

    const value = React.useMemo(() => ({ stateValue, context: firewallContext }), [
        stateValue,
        firewallContext,
    ]);

    return <context.Provider value={value}>{children}</context.Provider>;
};

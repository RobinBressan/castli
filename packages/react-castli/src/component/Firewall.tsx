import * as React from 'react';
import { useFirewall } from '../hook/useFirewall';

export interface FirewallProps {
    children: React.ReactNode;
    query?: Record<string, any>;
}

export const Firewall: React.SFC<FirewallProps> = ({ children, query }) => {
    const { value } = useFirewall(query);

    if (value !== 'granted') {
        return null;
    }

    return <>{children}</>;
};

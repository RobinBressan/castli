import { BasicAuthStrategy, Proxy } from '@castli/basic-auth-strategy';
import * as React from 'react';

import { Fortress, FortressProps } from '../fortress/Fortress';
import { Omit } from '../types';

export interface BasicAuthFortressProps extends Omit<FortressProps, 'strategy'> {
    children: React.ReactNode;
    proxy: Proxy;
}

export const BasicAuthFortress: React.SFC<BasicAuthFortressProps> = ({ proxy, ...otherProps }) => {
    return <Fortress {...otherProps} strategy={new BasicAuthStrategy(proxy)} />;
};

import { BasicAuthStrategy, Proxy } from '@castli/basic-auth-strategy';
import * as React from 'react';
import { animationFrameScheduler } from 'rxjs';

import { Fortress, FortressProps } from '../fortress/Fortress';
import { Omit } from '../types';

export interface BasicAuthFortressProps extends Omit<FortressProps, 'strategy'> {
    children: React.ReactNode;
    proxy: Proxy;
}

export const BasicAuthFortress: React.SFC<BasicAuthFortressProps> = ({
    proxy,
    scheduler = animationFrameScheduler,
    ...otherProps
}) => {
    return (
        <Fortress
            {...otherProps}
            scheduler={scheduler}
            strategy={new BasicAuthStrategy(proxy, scheduler)}
        />
    );
};

import { Proxy, SimpleAuthStrategy } from '@castli/simple-auth-strategy';
import * as React from 'react';
import { animationFrameScheduler } from 'rxjs';

import { Fortress, FortressProps } from '../fortress/Fortress';
import { Omit } from '../types';

export interface SimpleAuthFortressProps extends Omit<FortressProps, 'strategy'> {
    children: React.ReactNode;
    proxy: Proxy;
}

export const SimpleAuthFortress: React.SFC<SimpleAuthFortressProps> = ({
    proxy,
    scheduler = animationFrameScheduler,
    ...otherProps
}) => {
    return (
        <Fortress
            {...otherProps}
            scheduler={scheduler}
            strategy={new SimpleAuthStrategy(proxy, scheduler)}
        />
    );
};

import { Fortress as BaseFortress, FortressProps as BaseFortressProps, Omit } from '@castli/react';
import { Proxy, SimpleAuthStrategy } from '@castli/simple-auth-strategy';
import * as React from 'react';
import { animationFrameScheduler } from 'rxjs';

export interface FortressProps extends Omit<BaseFortressProps, 'strategy'> {
    children: React.ReactNode;
    proxy: Proxy;
}

export const Fortress: React.SFC<FortressProps> = ({
    proxy,
    scheduler = animationFrameScheduler,
    ...otherProps
}) => {
    return (
        <BaseFortress
            {...otherProps}
            scheduler={scheduler}
            strategy={new SimpleAuthStrategy(proxy, scheduler)}
        />
    );
};

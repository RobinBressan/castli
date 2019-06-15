import { OptionalPromise } from '../core/types';

export type Guard<
    FortressContext extends Record<string, any> = Record<string, any>,
    FirewallContext extends Record<string, any> = Record<string, any>
> = (
    query: Record<string, any>,
    fortressContext: FortressContext,
) => OptionalPromise<FirewallContext>;

import {
    Event,
    FirewallEvent,
    FirewallStateValue,
    FortressEvent,
    FortressStateValue,
} from '@castli/core';

export function createFortressEventSubscriber<FortressContext>(
    context: FortressContext,
    value: FortressStateValue,
    event: FortressEvent | Event<'xstate.init'>,
) {
    return [{ context, value }, event];
}

export function createFirewallEventSubscriber<FirewallContext>(
    context: FirewallContext,
    value: FirewallStateValue,
    event: FirewallEvent | Event<'xstate.init'>,
) {
    return [{ context, value }, event];
}

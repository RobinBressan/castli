import {
    Challenge,
    Event,
    FirewallEvent,
    FirewallStateValue,
    FortressEvent,
    FortressStateValue,
    Permission,
    User,
} from '../../';

export function createFortressEventSubscriber(
    challenges: Challenge[],
    value: FortressStateValue,
    event: FortressEvent | Event<'xstate.init'>,
) {
    return [{ context: { challenges }, value }, event];
}

export function createFirewallEventSubscriber(
    user: User,
    permissions: Permission[],
    value: FirewallStateValue,
    event: FirewallEvent | Event<'xstate.init'>,
) {
    return [{ context: { user, permissions }, value }, event];
}

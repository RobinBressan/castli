import {
    AuthenticationEvent,
    AuthenticationStateValues,
    AuthorizationEvent,
    AuthorizationStateValues,
    Challenge,
    Event,
    Permission,
    User,
} from '../../';

export function createSubscriberAuthenticationEvent(
    challenges: Challenge[],
    value: AuthenticationStateValues,
    event: AuthenticationEvent | Event<'xstate.init'>,
) {
    return [{ context: { challenges }, value }, event];
}

export function createSubscriberAuthorizationEvent(
    user: User,
    permissions: Permission[],
    value: AuthorizationStateValues,
    event: AuthorizationEvent | Event<'xstate.init'>,
) {
    return [{ context: { user, permissions }, value }, event];
}

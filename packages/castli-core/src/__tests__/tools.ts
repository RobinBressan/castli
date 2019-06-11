import { AuthenticationEvent, AuthenticationStates } from '../authentication/machine';
import { AuthorizationEvent, AuthorizationStates } from '../authorization/machine';
import { Challenge, Event, Permission, User } from '../types';

export function createSubscriberAuthenticationEvent(
    challenges: Challenge[],
    value: AuthenticationStates,
    event: AuthenticationEvent | Event<'xstate.init'>,
) {
    return [{ context: { challenges }, value }, event];
}

export function createSubscriberAuthorizationEvent(
    user: User,
    permissions: Permission[],
    value: AuthorizationStates,
    event: AuthorizationEvent | Event<'xstate.init'>,
) {
    return [{ context: { user, permissions }, value }, event];
}

import { AuthorizationEvent, AuthorizationStates } from '../authorization/machine';
import { Event, Permission, User } from '../types';

export function createSubscriberAuthorizationEvent(
    user: User,
    permissions: Permission[],
    value: AuthorizationStates,
    event: AuthorizationEvent | Event<'xstate.init'>,
) {
    return [{ context: { user, permissions }, value }, event];
}

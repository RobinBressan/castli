import { ObservableService } from '../observable-service';
import { Challenge, Proxy } from '../types';
import {
    AuthorizationContext,
    AuthorizationEvent,
    AuthorizationStateSchema,
    createMachine,
} from './machine';

export class AuthorizationService extends ObservableService<
    AuthorizationContext,
    AuthorizationStateSchema,
    AuthorizationEvent
> {
    constructor(proxy: Proxy, resolveChallenge: () => Challenge) {
        super(createMachine(proxy, resolveChallenge));
    }
}

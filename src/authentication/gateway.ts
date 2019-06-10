import { cloneDeep } from 'lodash';

import { AuthenticationContext, AuthenticationEvent } from './machine';
import { AuthenticationService } from './service';

import { Gateway } from '../core/gateway';

export class AuthenticationGateway extends Gateway<AuthenticationService> {
    public async challenge(context: AuthenticationContext, event: AuthenticationEvent) {
        let nextEvent: AuthenticationEvent['type'] = 'AUTHENTICATE';
        const rechallenge = () => (nextEvent = 'RECHALLENGE');

        try {
            const response = await this.proxy.challenge(
                event.query,
                cloneDeep(context.challenges),
                rechallenge,
            );
            context.challenges.push(response);
            this.service.sendEvent(nextEvent);
        } catch (error) {
            this.service.deauthenticate({ error });
        }
    }
}

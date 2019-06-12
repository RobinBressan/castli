import { cloneDeep } from 'lodash';

import { AuthenticationContext, AuthenticationEvent } from './machine';
import { AuthenticationService } from './service';

import { Gateway } from '../core/gateway';

export class AuthenticationGateway extends Gateway<AuthenticationService> {
    public async challenge(context: AuthenticationContext, event: AuthenticationEvent) {
        // depending on the proxy auth flow, we might need to perform several challenge requests
        // to achieve this, we provide to the proxy a lambda which will tamper with the next event to be dispachted in the service
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

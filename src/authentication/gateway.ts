import { AuthenticationService } from './service';

import { Gateway } from '../gateway';

export class AuthenticationGateway extends Gateway<AuthenticationService> {
    public async challenge(context, event) {
        try {
            const response = await this.proxy.challenge(event.query);
            context.challenge = response;
            this.service.send('AUTHENTICATE');
        } catch (error) {
            this.service.deauthenticate({ error });
        }
    }
}

import { AuthorizationService } from './service';

import { AuthenticationService } from '../authentication/service';
import { Gateway } from '../gateway';
import { Proxy } from '../types';

export class AuthorizationGateway extends Gateway<AuthorizationService> {
    private authenticationService: AuthenticationService;

    constructor(
        proxy: Proxy,
        lazyService: () => AuthorizationService,
        authenticationService: AuthenticationService,
    ) {
        super(proxy, lazyService);

        this.authenticationService = authenticationService;
    }

    private get challenge() {
        return this.authenticationService.state.context.challenge;
    }

    public async provision(context, event) {
        try {
            const { permissions, user } = await this.proxy.provision(event.query, this.challenge);

            context.permissions = permissions;
            context.user = user;

            this.service.authorize(event.query);
        } catch (error) {
            this.service.deauthenticate({ error });
        }
    }

    public async authorize(context, event) {
        try {
            await this.proxy.authorize(event.query, context.permissions, this.challenge);
            this.service.grant();
        } catch (error) {
            this.service.deny({ error });
        }
    }
}

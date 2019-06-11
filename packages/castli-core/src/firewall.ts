import { Subscription } from 'rxjs';

import { AuthenticationStates } from './authentication/machine';
import { AuthenticationService } from './authentication/service';
import { AuthorizationStateSchema } from './authorization/machine';
import { AuthorizationService } from './authorization/service';
import { Guard, Proxy } from './types';

export class Firewall {
    public readonly query: Record<string, any>;

    public readonly subscribe: AuthorizationService['subscribe'];
    public readonly pipe: AuthorizationService['pipe'];

    private authenticationService: AuthenticationService;
    private authorizationService: AuthorizationService;
    private authenticationSubscription: Subscription;

    constructor(
        proxy: Proxy,
        guard: Guard,
        query: Record<string, any>,
        authenticationService: AuthenticationService,
    ) {
        this.authenticationService = authenticationService;
        this.query = query;
        this.authorizationService = new AuthorizationService(
            proxy,
            guard,
            this.authenticationService,
        );
        this.authenticationSubscription = this.authenticationService.subscribe(
            this.onAuthenticationStateChange,
        );

        this.pipe = this.authorizationService.pipe.bind(this.authorizationService);
        this.subscribe = this.authorizationService.subscribe.bind(this.authorizationService);
    }

    get state() {
        return this.authorizationService.state;
    }

    public dispose() {
        this.authenticationSubscription.unsubscribe();
    }

    public waitFor(state: keyof AuthorizationStateSchema['states']) {
        return this.authorizationService.waitFor(state);
    }

    private onAuthenticationStateChange = value => {
        const [state] = value;

        switch (state.value as AuthenticationStates) {
            case 'authenticated':
                this.authorizationService.provision(this.query);
                break;
            case 'unauthenticated':
                this.authorizationService.deauthenticate();
                break;
            case 'idle':
                break;
            default:
                this.authorizationService.reset();
        }
    };
}

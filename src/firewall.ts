import { Observable, Subscriber, Subscription } from 'rxjs';

import {
    AuthenticationContext,
    AuthenticationStates,
    State as AuthenticationState,
} from './authentication/machine';
import { AuthenticationService } from './authentication/service';
import {
    AuthorizationContext,
    AuthorizationStates,
    State as AuthorizationState,
} from './authorization/machine';
import { AuthorizationService } from './authorization/service';
import { Proxy } from './types';

interface PublicState extends AuthorizationContext {
    stateValue: AuthorizationStates;
}

export class Firewall extends Observable<PublicState> {
    public readonly query: Record<string, any>;

    private authenticationService: AuthenticationService;
    private authorizationService: AuthorizationService;

    private authorizationSubscription: Subscription;
    private authenticationSubscription: Subscription;
    private challenge: AuthenticationContext['challenge'];
    private observer: Subscriber<PublicState>;
    private proxy: Proxy;

    constructor(
        proxy: Proxy,
        authenticationService: AuthenticationService,
        query?: Record<string, any>,
    ) {
        super(o => {
            this.observer = o;
        });
        this.authenticationService = authenticationService;
        this.proxy = proxy;
        this.query = query;
        this.authorizationService = new AuthorizationService(this.proxy, () => this.challenge);
        this.authenticationSubscription = this.authenticationService.subscribe(
            this.onAuthenticationStateChange,
        );
        this.authorizationSubscription = this.authorizationService.subscribe(
            this.onAuthorizationStateChange,
        );
    }

    public complete() {
        this.authenticationSubscription.unsubscribe();
        this.authorizationSubscription.unsubscribe();
        this.observer.complete();
    }

    private onAuthenticationStateChange = (state: AuthenticationState) => {
        this.challenge = state.context.challenge;

        switch (state.value as AuthenticationStates) {
            case 'authenticated':
                this.authorizationService.send({ type: 'PROVISION', query: this.query });
                break;
            case 'unauthenticated':
                this.authorizationService.send({ type: 'SKIP' });
                break;
            default:
                this.authorizationService.send({ type: 'RESET' });
        }
    };

    private onAuthorizationStateChange = (state: AuthorizationState) => {
        this.observer.next({
            ...state.context,
            stateValue: state.value as any,
        });
    };
}

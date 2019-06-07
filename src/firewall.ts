import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { filter } from 'rxjs/operators';
import { AuthenticationContext, AuthenticationStates } from './authentication/machine';
import { AuthenticationService } from './authentication/service';
import {
    AuthorizationContext,
    AuthorizationStates,
    AuthorizationStateSchema,
} from './authorization/machine';
import { AuthorizationService } from './authorization/service';
import { Proxy } from './types';

interface FirewallState extends AuthorizationContext {
    stateValue: AuthorizationStates;
}

export class Firewall {
    public readonly query: Record<string, any>;

    public readonly subscribe: Observable<FirewallState>['subscribe'];
    public readonly pipe: Observable<FirewallState>['pipe'];

    private authenticationService: AuthenticationService;
    private authorizationService: AuthorizationService;

    private authorizationSubscription: Subscription;
    private authenticationSubscription: Subscription;
    private challenge: AuthenticationContext['challenge'];
    private in$ = new BehaviorSubject<FirewallState>(null);
    private proxy: Proxy;

    private out$ = this.in$.pipe(filter(v => v !== null));

    constructor(
        proxy: Proxy,
        authenticationService: AuthenticationService,
        query?: Record<string, any>,
    ) {
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

        this.pipe = this.out$.pipe.bind(this.out$);
        this.subscribe = this.out$.subscribe.bind(this.out$);
    }

    get service() {
        return this.authorizationService;
    }

    public complete() {
        this.authenticationSubscription.unsubscribe();
        this.authorizationSubscription.unsubscribe();
        this.in$.complete();
    }

    public waitFor(state: keyof AuthorizationStateSchema['states']) {
        return this.authorizationService.waitFor(state);
    }

    private onAuthenticationStateChange = value => {
        const [state] = value;

        this.challenge = state.context.challenge;

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

    private onAuthorizationStateChange = value => {
        const [state] = value;

        this.in$.next({
            ...state.context,
            stateValue: state.value as any,
        });
    };
}

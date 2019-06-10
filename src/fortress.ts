import { Observable } from 'rxjs';
import { State } from 'xstate';
import { AuthenticationEvent, AuthenticationStateSchema } from './authentication/machine';
import { AuthenticationService } from './authentication/service';
import { Firewall } from './firewall';
import { Proxy } from './types';

export class Fortress {
    public readonly subscribe: Observable<
        [State<AuthenticationStateSchema, AuthenticationEvent>, AuthenticationEvent]
    >['subscribe'];
    public readonly pipe: Observable<
        [State<AuthenticationStateSchema, AuthenticationEvent>, AuthenticationEvent]
    >['pipe'];

    private authenticationService: AuthenticationService;
    private proxy: Proxy;

    constructor(proxy: Proxy) {
        this.proxy = proxy;
        this.authenticationService = new AuthenticationService(proxy);

        this.pipe = this.authenticationService.pipe.bind(this.authenticationService);
        this.subscribe = this.authenticationService.subscribe.bind(this.authenticationService);
    }

    get state() {
        return this.authenticationService.state;
    }

    public createFirewall(query?: Record<string, any>) {
        return new Firewall(this.proxy, this.authenticationService, query);
    }

    public challenge(query?: Record<string, any>) {
        this.authenticationService.challenge(query);
    }

    public deauthenticate(query?: Record<string, any>) {
        this.authenticationService.deauthenticate(query);
    }
}

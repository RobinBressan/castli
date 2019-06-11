import { AuthenticationService } from './authentication/service';
import { Firewall } from './firewall';
import { Guard, Proxy } from './types';

export class Fortress {
    public readonly challenge: AuthenticationService['challenge'];
    public readonly deauthenticate: AuthenticationService['deauthenticate'];
    public readonly pipe: AuthenticationService['pipe'];
    public readonly subscribe: AuthenticationService['subscribe'];
    public readonly waitFor: AuthenticationService['waitFor'];

    private authenticationService: AuthenticationService;
    private guard: Guard;
    private proxy: Proxy;

    constructor(proxy: Proxy, guard: Guard) {
        this.guard = guard;
        this.proxy = proxy;
        this.authenticationService = new AuthenticationService(proxy);

        this.challenge = this.authenticationService.challenge.bind(this.authenticationService);
        this.deauthenticate = this.authenticationService.deauthenticate.bind(
            this.authenticationService,
        );
        this.pipe = this.authenticationService.pipe.bind(this.authenticationService);
        this.subscribe = this.authenticationService.subscribe.bind(this.authenticationService);
        this.waitFor = this.authenticationService.waitFor.bind(this.authenticationService);
    }

    get state() {
        return this.authenticationService.state;
    }

    public createFirewall(query: Record<string, any> = null) {
        return new Firewall(this.proxy, this.guard, query, this.authenticationService);
    }
}

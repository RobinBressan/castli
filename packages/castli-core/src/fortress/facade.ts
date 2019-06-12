import { Facade } from '../core/facade';
import { Guard, Proxy } from '../core/types';
import { Firewall } from '../firewall';
import { AuthenticationService } from './service';

/**
 * A Fortress is the authentication layer of Castli.
 * It handles the workflow needed to retrieve challenges which will be used later on to perform authorization requests
 */
export class Fortress extends Facade<AuthenticationService> {
    public readonly challenge: AuthenticationService['challenge'];
    public readonly deauthenticate: AuthenticationService['deauthenticate'];

    private guard: Guard;
    private proxy: Proxy;

    constructor(proxy: Proxy, guard: Guard) {
        super(new AuthenticationService(proxy));

        this.guard = guard;
        this.proxy = proxy;

        this.challenge = this.service.challenge.bind(this.service);
        this.deauthenticate = this.service.deauthenticate.bind(this.service);
    }

    public createFirewall(query: Record<string, any> = null) {
        return new Firewall(this.proxy, this.guard, query, this);
    }
}

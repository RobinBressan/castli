import { SchedulerLike } from 'rxjs';
import { Facade } from '../core/facade';
import { Guard, Proxy } from '../core/types';
import { Firewall } from '../firewall';
import { FortressService } from './service';

/**
 * A Fortress is the authentication layer of Castli.
 * It handles the workflow needed to retrieve challenges which will be used later on to perform authorization requests
 */
export class Fortress extends Facade<FortressService> {
    public readonly challenge: FortressService['challenge'];
    public readonly deauthenticate: FortressService['deauthenticate'];

    private guard: Guard;
    private proxy: Proxy;

    constructor(proxy: Proxy, guard: Guard, scheduler?: SchedulerLike) {
        super(new FortressService(proxy, scheduler));

        this.guard = guard;
        this.proxy = proxy;

        this.challenge = this.service.challenge.bind(this.service);
        this.deauthenticate = this.service.deauthenticate.bind(this.service);
    }

    public createFirewall(query: Record<string, any> = null, scheduler?: SchedulerLike) {
        return new Firewall(this.proxy, this.guard, query, this, scheduler);
    }
}

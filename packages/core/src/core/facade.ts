import { ObservableService } from './observable-service';

/**
 * A facade is the public API of a domain
 * To consume a domain API (fortress or firewall for instance) we should only rely on its facade
 */
export class Facade<Service extends ObservableService> {
    public readonly pipe: Service['pipe'];
    public readonly subscribe: Service['subscribe'];
    public readonly waitFor$: Service['waitFor$'];

    public readonly service: Service;

    constructor(service: Service) {
        this.service = service;

        this.pipe = this.service.pipe.bind(this.service);
        this.subscribe = this.service.subscribe.bind(this.service);
        this.waitFor$ = this.service.waitFor$.bind(this.service);
    }

    get state() {
        return this.service.state;
    }
}

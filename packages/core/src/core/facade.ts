import { ObservableService } from './observable-service';

/**
 * A facade is the public API of a domain
 * To consume a domain API (fortress or firewall for instance) we should only rely on its facade
 */
export abstract class Facade<Service extends ObservableService> {
    public pipe: Service['pipe'];
    public subscribe: Service['subscribe'];
    public waitFor: Service['waitFor'];

    protected service: Service;

    constructor(service: Service) {
        this.service = service;

        this.pipe = this.service.pipe.bind(this.service);
        this.subscribe = this.service.subscribe.bind(this.service);
        this.waitFor = this.service.waitFor.bind(this.service);
    }

    get state() {
        return this.service.state;
    }
}

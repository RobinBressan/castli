import { Proxy } from '../types';
import { ObservableService } from './observable-service';

export abstract class Gateway<Service extends ObservableService> {
    protected deferredService: () => Service;
    protected proxy: Proxy;

    constructor(proxy: Proxy, deferredService: () => Service) {
        this.deferredService = deferredService;
        this.proxy = proxy;
    }

    protected get service() {
        return this.deferredService();
    }
}

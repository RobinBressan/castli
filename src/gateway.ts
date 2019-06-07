import { ObservableService } from './observable-service';
import { Proxy } from './types';

export abstract class Gateway<Service extends ObservableService> {
    protected lazyService: () => Service;
    protected proxy: Proxy;

    constructor(proxy: Proxy, lazyService: () => Service) {
        this.lazyService = lazyService;
        this.proxy = proxy;
    }

    protected get service() {
        return this.lazyService();
    }
}
